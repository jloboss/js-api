let myChart = null;

async function getMonedas() {
  try {
    const monedaSeleccionada = document.getElementById("idMonedas").value;
    const endpoint = `https://mindicador.cl/api/${monedaSeleccionada}`;
    const res = await fetch(endpoint);
    const monedas = await res.json();
    const valorMoneda = monedas.serie[0].valor;
    const nombreMoneda = monedas.codigo;
    const serieValorMoneda = monedas.serie.slice(0, 10).reverse();
    return { valorMoneda, nombreMoneda, serieValorMoneda };
  } catch (e) {
    const errorSpan = document.getElementById("errorSpan");
    errorSpan.innerHTML = `Algo salió mal! Error: ${e.message}`;
  }
}

function prepararConfiguracionParaLaGrafica(serieValorMoneda, moneda) {
  const labels = [];
  const valores = [];

  serieValorMoneda.forEach((fechaArreglo) => {
    labels.push(fechaArreglo.fecha.slice(0, 10));
    valores.push(fechaArreglo.valor);
  });

  const config = {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: `${moneda} - Valor`,
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderColor: "rgba(255, 99, 132, 1)",
          data: valores,
          borderWidth: 1,
          pointBackgroundColor: "rgba(255, 99, 132, 1)",
          pointBorderColor: "#fff",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: `Valor de ${moneda} los últimos 10 dias `,
        },
        tooltip: {
          mode: "index",
          intersect: false,
        },
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: "Fecha",
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: "Valor",
          },
          ticks: {
            callback: function (value) {
              return value.toLocaleString();
            },
            maxTicksLimit: 10,
          },
        },
      },
      layout: {
        padding: {
          top: 10,
          right: 10,
          bottom: 10,
          left: 10,
        },
      },
    },
  };

  return config;
}

async function renderizar(montoPesos) {
  try {
    const { valorMoneda, nombreMoneda, serieValorMoneda } = await getMonedas();
    console.log(serieValorMoneda);
    if (!isNaN(valorMoneda)) {
      const conversion = montoPesos / valorMoneda;
      document.getElementById(
        "respuestaBoton"
      ).innerText = `${conversion.toFixed(2)} ${nombreMoneda}`;
    } else {
      document.getElementById("respuestaBoton").innerText =
        "Error en la conversión";
    }

    const config = prepararConfiguracionParaLaGrafica(
      serieValorMoneda,
      nombreMoneda
    );

    if (myChart) {
      myChart.destroy();
    }

    const chartDOM = document.getElementById("myChart");
    myChart = new Chart(chartDOM, config);
  } catch (e) {
    console.error(`Error al renderizar: ${e.message}`);
    document.getElementById("respuestaBoton").innerText =
      "Error en la conversión";
  }
}

document.getElementById("botonBuscar").addEventListener("click", async () => {
  const montoClp = parseFloat(document.getElementById("monto").value);
  document.querySelector(".grafico").style.display = "flex";
  if (!isNaN(montoClp)) {
    await renderizar(montoClp);
  } else {
    document.getElementById("respuestaBoton").innerText =
      "Ingrese un Valor a Convertir";
  }
});
