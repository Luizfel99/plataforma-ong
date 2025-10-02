window.onload = function() {
  // 🎯 Gráfico de Pizza - Recursos por Projeto
  let ctx1 = document.getElementById('graficoPizza').getContext('2d');
  new Chart(ctx1, {
    type: 'pie',
    data: {
      labels: ['Educação', 'Saúde', 'Meio Ambiente'],
      datasets: [{
        data: [40, 30, 30],
        backgroundColor: ['#ff6384', '#36a2eb', '#4caf50']
      }]
    }
  });

  // 🎯 Gráfico de Linha - Voluntários por Ano
  let ctx2 = document.getElementById('graficoLinha').getContext('2d');
  new Chart(ctx2, {
    type: 'line',
    data: {
      labels: ['2021', '2022', '2023', '2024'],
      datasets: [{
        label: 'Número de Voluntários',
        data: [50, 120, 200, 300],
        borderColor: '#36a2eb',
        fill: false,
        tension: 0.1
      }]
    }
  });

  // 🎯 Gráfico de Barras - Impacto Social por Região
  let ctx3 = document.getElementById('graficoBarras').getContext('2d');
  new Chart(ctx3, {
    type: 'bar',
    data: {
      labels: ['Sul', 'Sudeste', 'Norte', 'Nordeste', 'Centro-Oeste'],
      datasets: [{
        label: 'Pessoas Beneficiadas',
        data: [150, 300, 100, 200, 120],
        backgroundColor: ['#ff9800', '#8e44ad', '#009688', '#f44336', '#2196f3']
      }]
    }
  });
};
