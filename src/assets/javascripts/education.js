import { Chart } from "frappe-charts";

const buildChartEducation = (municipalityIndex, municipality, resultEducation) => {
    const modalTitle = document.getElementById("modal-title");
    modalTitle.innerText = municipality;

    const labels = Object.values(resultEducation.dimension.Vuosi.category.label);
    const maleIndex = 9;
    const femaleIndex = 18;
    const ludValue = 5;
    const maleLudRates = []
    const femaleLudRates = []     

    console.log("length: ", resultEducation.value.length);
    const fullYearLength = 310*27;
    resultEducation.value.forEach((value, yearIndex) => {
        if (yearIndex%fullYearLength === 0) {
            maleLudRates.push(Math.floor(((resultEducation.value[yearIndex+municipalityIndex+maleIndex+ludValue]/resultEducation.value[yearIndex+municipalityIndex+maleIndex]))*1000)/10)
            femaleLudRates.push(Math.floor(((resultEducation.value[yearIndex+municipalityIndex+femaleIndex+ludValue]/resultEducation.value[yearIndex+municipalityIndex+femaleIndex]))*1000)/10)
        }
    })

    const chartData = {
        labels: labels,
        datasets: [
            {
                name: "Male",
                values: maleLudRates
            },
            {
                name: "Female",
                values: femaleLudRates
            }
        ]
    }

    const chart = new Chart("#chart", {
        title: "Lower Higher Education rates between genders (%)",
        data: chartData,
        type: "line",
        heigth: 450,
        colors: ["#0202fa", "#fa0213"]
    })

    return;
}

const generatePopupEducation = (feature, resultEducation, index, year) => {
    const divPopupBox = document.createElement("div");
    divPopupBox.className = "leaflet-custom-popup-box";   
    
    const h4Name = document.createElement("h4");
    h4Name.innerText = feature.properties.name;
    divPopupBox.appendChild(h4Name);  
    
    const pPpg = document.createElement("p");
    pPpg.innerText = "Post-primary Degree Rate: " + Math.floor(((resultEducation.value[index+year*310*27+1]/resultEducation.value[index+year*310*27+0]))*1000)/10 + "%";
    divPopupBox.appendChild(pPpg); 
    
    const pSsRate = document.createElement("p");
    pSsRate.innerText = "Secondary School Rate: " + Math.floor(((resultEducation.value[index+year*310*27+2]/resultEducation.value[index+year*310*27+0]))*1000)/10 + "%";
    divPopupBox.appendChild(pSsRate); 

    const pLudRate = document.createElement("p");
    pLudRate.className = "map-value";
    pLudRate.innerText = "Lower University Degree Rate: " + Math.floor(((resultEducation.value[index+year*310*27+5]/resultEducation.value[index+year*310*27+0]))*1000)/10 + "%";
    divPopupBox.appendChild(pLudRate);   

    const pHudRate = document.createElement("p");
    pHudRate.innerText = "Higher University Degree Rate: " + Math.floor(((resultEducation.value[index+year*310*27+6]/resultEducation.value[index+year*310*27+0]))*1000)/10 + "%";
    divPopupBox.appendChild(pHudRate);

    const pRdRate = document.createElement("p");
    pRdRate.innerText = "Research Degree Rate: " + Math.floor(((resultEducation.value[index+year*310*27+7]/resultEducation.value[index+year*310*27+0]))*1000)/10 + "%";
    divPopupBox.appendChild(pRdRate);

    const btnModal = document.createElement("button");
    btnModal.addEventListener("click", (e) => {
        buildChartEducation(index, feature.properties.name, resultEducation);
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

export { generatePopupEducation };