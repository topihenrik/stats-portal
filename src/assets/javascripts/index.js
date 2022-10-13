import "../stylesheets/reset.css";
import "../stylesheets/style.css"
import "../stylesheets/main.scss";
import { Modal } from 'bootstrap'
import L from "../../../node_modules/leaflet/dist/leaflet.js";
import "../../../node_modules/leaflet/dist/leaflet.css";
import "leaflet-easyprint"
import employmentJSON from "../jsons/employment.json";
import educationJSON from "../jsons/education.json";
import migrationJSON from "../jsons/migration.json";
import { generatePopupEmployment } from "./employment";
import { generatePopupEducation } from "./education";
import { generatePopupMigration } from "./migration";

const fetchData = async(stat) => {
    try {
        let fetchUrl = undefined;
        let fetchBody = undefined;
        if (stat === "employment") {
            fetchUrl = "https://statfin.stat.fi:443/PxWeb/api/v1/fi/StatFin/tyokay/statfin_tyokay_pxt_115b.px";
            fetchBody = JSON.stringify(employmentJSON);
        } else if (stat === "education") {
            fetchUrl = "https://statfin.stat.fi:443/PxWeb/api/v1/fi/StatFin/vkour/statfin_vkour_pxt_12bq.px";
            fetchBody = JSON.stringify(educationJSON);
        } else if (stat === "migration") {
            fetchUrl = "https://statfin.stat.fi:443/PxWeb/api/v1/fi/StatFin/muutl/statfin_muutl_pxt_11ae.px";
            fetchBody = JSON.stringify(migrationJSON);
        }

        if (fetchBody === undefined) return;

        const dataGeo = await fetch("https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326");
        const dataStat = await fetch(fetchUrl,
            {
                method: "POST",
                body: fetchBody
            });
        
        const resultGeo = await dataGeo.json();
        const resultStat = await dataStat.json();

        return {resultGeo, resultStat};
    } catch (error) {
        console.log(error)
    }
}

const initMap = (map = undefined) => {
    L.easyPrint({
        title: "test111",
        exportOnly: true,
        position: "topleft",
        sizeModes: ['A4Portrait', 'A4Landscape']
    }).addTo(map);

    const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 20,
        attribution: "© OpenStreetMap"
    })
    .addTo(map);

    const google = L.tileLayer("https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}", {
        maxZoom: 20,
        minZoom: 2,
        subdomains: ["mt0", "mt1", "mt2", "mt3"]
    })

    const baseMaps = {
        "OpenStreetMap": osm,
        "Google Maps": google
    }

    L.control.layers(baseMaps).addTo(map);
}

const addGeoJson = async (map = undefined, stat = "employment", fullYear = 2020, geoLayer = undefined) => {
    try {
        const {resultGeo, resultStat} = await fetchData(stat);
        geoLayer.clearLayers();
        const year = fullYear-2016;
        let geoJson = undefined;

        const firstColor = document.getElementById("first-color");
        const secondColor = document.getElementById("second-color");
        const thirdColor = document.getElementById("third-color");

        if (stat === "employment") {
            geoJson = L.geoJSON(resultGeo, {
                onEachFeature: (feature, layer) => {
                    if (!feature.id) return;
                    const index = (resultStat.dimension.Alue.category.index["KU"+feature.properties.kunta])*45;
                    layer.bindTooltip(feature.properties.name);
                    layer.bindPopup(generatePopupEmployment(feature, resultStat, index, year));
                    const hue = Math.min(Math.floor(Math.pow(resultStat.value[index+30+year]/resultStat.value[index+15+year],3)*100), 120);
                    layer.setStyle({color: `hsl(${hue}, 75%, 50%)`});
                },
                weigth: 2
            }).addTo(geoLayer);
            firstColor.innerText = "Green: 10%";
            secondColor.innerText = "Yellow: 15%";
            thirdColor.innerText = "Red: 25%";
        } else if (stat === "education") {
            geoJson = L.geoJSON(resultGeo, {
                onEachFeature: (feature, layer) => {
                    if (!feature.id) return;
                    const index = (resultStat.dimension.Alue.category.index["KU"+feature.properties.kunta])*27;
                    layer.bindTooltip(feature.properties.name);
                    layer.bindPopup(generatePopupEducation(feature, resultStat, index, year));
                    const hue = Math.min(Math.floor(((resultStat.value[index+5+year*310*27]/resultStat.value[index+0+year*310*27])*700)), 120);
                    layer.setStyle({color: `hsl(${hue}, 75%, 50%)`});
                },
                weigth: 2
            }).addTo(geoLayer);
            firstColor.innerText = "Green: 10%";
            secondColor.innerText = "Yellow: 6%";
            thirdColor.innerText = "Red: 4%";
        } else if (stat === "migration") {
            geoJson = L.geoJSON(resultGeo, {
                onEachFeature: (feature, layer) => {
                    if (!feature.id) return;
                    const index = (resultStat.dimension.Alue.category.index["KU"+feature.properties.kunta])*2;
                    layer.bindTooltip(feature.properties.name);
                    layer.bindPopup(generatePopupMigration(feature, resultStat, index, year));
                    const hue = Math.min(Math.floor(((resultStat.value[index+0+year*310*2]/resultStat.value[index+1+year*310*2])*70)), 120);
                    layer.setStyle({color: `hsl(${hue}, 75%, 50%)`});
                },
                weigth: 2
            }).addTo(geoLayer);
            firstColor.innerText = "Green: 50%";
            secondColor.innerText = "Yellow: 0%";
            thirdColor.innerText = "Red: -50%";
        }

        map.fitBounds(geoJson.getBounds());
    } catch (error) {
        console.log(error);
    }
}

const initialize = () => {
    if (localStorage.getItem("init") === null) {
        const infoModal = document.getElementById("info-modal");
        Modal.getOrCreateInstance(infoModal).show();
        localStorage.setItem("init", true);
    }

    document.getElementById("btn-info").addEventListener("click", (e) => {
        e.preventDefault();

    })

    const map = L.map("map", {minZoom: -3});
    const geoLayer = L.layerGroup().addTo(map);

    document.getElementById("btn-minimize").addEventListener("click", (e) => {
        document.getElementById("colors-info").style = "display: none;";
        document.getElementById("btn-palette").style = "display: flex;"
    })

    document.getElementById("btn-palette").addEventListener("click", (e) => {
        document.getElementById("colors-info").style = "display: flex;";
        document.getElementById("btn-palette").style = "display: none;"
    })

    const formData = document.getElementById("form-data");
    const selectStat = document.getElementById("select-stat");
    const selectYear = document.getElementById("select-year");
    formData.addEventListener("change", (e) => {
        e.preventDefault();
        const stat = selectStat.value;
        const year = parseInt(selectYear.value);
        addGeoJson(map, stat, year, geoLayer);
    })
    
    initMap(map);
    addGeoJson(map, undefined, undefined, geoLayer);
}

initialize();