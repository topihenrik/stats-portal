import { Chart } from "frappe-charts";

const buildChartEmployment = (index, municipality, resultEmployment) => {
    try {   
        const modalTitle = document.getElementById("modal-title");
        modalTitle.innerText = municipality;
        
        const labels = Object.values(resultEmployment.dimension.Vuosi.category.label);
        const maleWorkforceValues = resultEmployment.value.slice(index+5+15, index+5+15+5);
        const maleEmployedValues = resultEmployment.value.slice(index+5+30, index+5+30+5);
        const maleUnemploymentRates = [];
        maleWorkforceValues.forEach((workForceValue, index) => {
            maleUnemploymentRates.push(Math.floor((1-(maleEmployedValues[index]/workForceValue))*1000)/10);
        })

        const femaleWorkforceValues = resultEmployment.value.slice(index+10+15, index+10+15+5);
        const femaleEmployedValues = resultEmployment.value.slice(index+10+30, index+10+30+5);
        const femaleUnemploymentRates = [];
        femaleWorkforceValues.forEach((workForceValue, index) => {
            femaleUnemploymentRates.push(Math.floor((1-(femaleEmployedValues[index]/workForceValue))*1000)/10);
        })
        
        const chartData = {
            labels: labels,
            datasets: [
                {
                    name: "Male",
                    values: maleUnemploymentRates
                },
                {
                    name: "Female",
                    values: femaleUnemploymentRates
                }
            ]
        }

        const chart = new Chart("#chart", {
            title: "Unemployment rates between genders (%)",
            data: chartData,
            type: "line",
            heigth: 450,
            colors: ["#0202fa", "#fa0213"]
        })
    


    } catch (error) {
        console.log(error);
    }
}


const generatePopupEmployment = (feature, resultEmployment, index, year) => {
    const divPopupBox = document.createElement("div");
    divPopupBox.className = "leaflet-custom-popup-box";

    const h4Name = document.createElement("h4");
    h4Name.innerText = feature.properties.name;
    divPopupBox.appendChild(h4Name);

    const pUnRate = document.createElement("p");
    pUnRate.innerText = "Unemployment Rate: " + Math.floor((1-(resultEmployment.value[index+year+30]/resultEmployment.value[index+year+15]))*1000)/10 + "%";
    divPopupBox.appendChild(pUnRate);

    const pPop = document.createElement("p");
    pPop.innerText = "Population: " + resultEmployment.value[index+year+0].toString().replace(/(\d)(?=(\d{3})+$)/g, '$1 ');
    divPopupBox.appendChild(pPop);

    const pWork = document.createElement("p");
    pWork.innerText = "Workforce: " + resultEmployment.value[index+year+15].toString().replace(/(\d)(?=(\d{3})+$)/g, '$1 ');
    divPopupBox.appendChild(pWork);

    const pEmp = document.createElement("p");
    pEmp.innerText = "Employed: " + resultEmployment.value[index+year+30].toString().replace(/(\d)(?=(\d{3})+$)/g, '$1 ');
    divPopupBox.appendChild(pEmp);

    const btnModal = document.createElement("button");
    btnModal.value = index;
    btnModal.addEventListener("click", (e) => {
        buildChartEmployment(index, feature.properties.name, resultEmployment);
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

export { generatePopupEmployment };