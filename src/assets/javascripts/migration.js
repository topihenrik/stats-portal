import { Chart } from "frappe-charts";

// Builds a chart about intermunicipal migration
const buildChartMigration = (municipalityIndex, municipality, resultMigration) => {
    const modalTitle = document.getElementById("modal-title");
    modalTitle.innerText = municipality;

    const labels = Object.values(resultMigration.dimension.Vuosi.category.label);
    const migrationValues = [];
    const fullYearLength = 310*2;

    for (let yearIndex = 0; yearIndex < resultMigration.value.length; yearIndex++) {
        if(yearIndex%fullYearLength === 0) {
            migrationValues.push((resultMigration.value[yearIndex+municipalityIndex]-resultMigration.value[yearIndex+municipalityIndex+1]))
        }
    }

    const chartData = {
        labels: labels,
        datasets: [
            {
                name: "Persons",
                values: migrationValues,
            }
        ],
        yMarkers: [{ label: "", value: 0 }]
    }

    const char = new Chart("#chart", {
        title: "Net Migration (persons)",
        data: chartData,
        type: "bar",
        valuesOverPoints: 1,
        heigth: 450,
        colors: ["var(--bs-primary)"]
    })
    
    return;
}

// Generates a leaflet popup for a municipality
const generatePopupMigration = (feature, resultMigration, index, year) => {
    const divPopupBox = document.createElement("div");
    divPopupBox.className = "leaflet-custom-popup-box";

    const h4Name = document.createElement("h4");
    h4Name.innerText = feature.properties.name;
    divPopupBox.appendChild(h4Name);

    const pMigrationNet = document.createElement("p");
    pMigrationNet.innerText = "Net Migration";
    divPopupBox.appendChild(pMigrationNet);

    const ulMigrationNet = document.createElement("ul");
    ulMigrationNet.id = "ul-migration-net";
    
    const liMigrationValue = document.createElement("li");
    liMigrationValue.className = "map-value";
    const migrationValue = (resultMigration.value[index+year*310*2]/resultMigration.value[index+year*310*2+1]);
    if (migrationValue<1) {
        liMigrationValue.innerText = "percentage: " + Math.floor((-1*(1-migrationValue))*1000)/10 + "%";
    } else {
        liMigrationValue.innerText = "percentage: +" + Math.floor((-1*(1-migrationValue))*1000)/10 + "%"
    }
    ulMigrationNet.appendChild(liMigrationValue);

    const liMigrationValuePersons = document.createElement("li");
    liMigrationValuePersons.innerText = "persons:" + (resultMigration.value[index+year*310*2]-resultMigration.value[index+year*310*2+1]);
    ulMigrationNet.appendChild(liMigrationValuePersons);
    divPopupBox.appendChild(ulMigrationNet);

    const pInMigration = document.createElement("p");
    pInMigration.innerText = "In-Migration: " + resultMigration.value[index+year*310*2].toString().replace(/(\d)(?=(\d{3})+$)/g, '$1 ');
    divPopupBox.appendChild(pInMigration);

    const pOutMigration = document.createElement("p");
    pOutMigration.innerText = "Out-Migration: " + resultMigration.value[index+year*310*2+1].toString().replace(/(\d)(?=(\d{3})+$)/g, '$1 ');
    divPopupBox.appendChild(pOutMigration);

    const btnModal = document.createElement("button");
    btnModal.addEventListener("click", (e) => {
        buildChartMigration(index, feature.properties.name, resultMigration);
    });
    btnModal.id = "btn-modal";
    btnModal.type = "button";
    btnModal.classList.add("btn", "btn-primary");
    btnModal.setAttribute("data-bs-toggle", "modal");
    btnModal.setAttribute("data-bs-target", "#chart-modal");
    btnModal.innerText = "Show chart";
    divPopupBox.appendChild(btnModal);

    return divPopupBox;
}

export { generatePopupMigration };