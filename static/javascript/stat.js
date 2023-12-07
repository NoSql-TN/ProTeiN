document.addEventListener("DOMContentLoaded", function (event) {
    var canvas0 = document.getElementById('myChart').getContext('2d');

    const graph0 = fetch('/relations')
        .then(response => response.json())
        .then(json => {
            // [{'p.Proteinid': 'P36406', 'nombreRelations': 4256}, {'p.Proteinid': 'O60229', 'nombreRelations': 4206}, {'p.Proteinid': 'O75962', 'nombreRelations': 4196}, {'p.Proteinid': 'P08581', 'nombreRelations': 3714}, {'p.Proteinid': 'P04629', 'nombreRelations': 3562}, {'p.Proteinid': 'O15197', 'nombreRelations': 3528}, {'p.Proteinid': 'P29320', 'nombreRelations': 3528}, {'p.Proteinid': 'P29323', 'nombreRelations': 3528}, {'p.Proteinid': 'P21709', 'nombreRelations': 3528}, {'p.Proteinid': 'P29317', 'nombreRelations': 3526}]
            // i want to create  a histogram where the bins are the number of relations and the x axis is the protein id
            console
            var labels = [];
            var data = [];
            for (var i = 0; i < json.length; i++) {
                labels.push(json[i]['p.Proteinid']);
                data.push(json[i]['nombreRelations']);
            }
            console.log(data);
            console.log(labels);
            var myChart = new Chart(canvas0, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Number of relations',
                        data: data,
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderColor: 'rgba(255,99,132,1)'
                    }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true,
                                stepSize: 1
                            }
                        }]
                    }
                }
            });
        });

    var canvas1 = document.getElementById('myChart1').getContext('2d');

    const graph1 = fetch('/jaccard')
        .then(response => response.json())
        .then(json => {
            // [{'p.Proteinid': 'P36406', 'nombreRelations': 4256}, {'p.Proteinid': 'O60229', 'nombreRelations': 4206}, {'p.Proteinid': 'O75962', 'nombreRelations': 4196}, {'p.Proteinid': 'P08581', 'nombreRelations': 3714}, {'p.Proteinid': 'P04629', 'nombreRelations': 3562}, {'p.Proteinid': 'O15197', 'nombreRelations': 3528}, {'p.Proteinid': 'P29320', 'nombreRelations': 3528}, {'p.Proteinid': 'P29323', 'nombreRelations': 3528}, {'p.Proteinid': 'P21709', 'nombreRelations': 3528}, {'p.Proteinid': 'P29317', 'nombreRelations': 3526}]
            // i want to create  a histogram where the bins are the number of relations and the x axis is the protein id
            console
            var labels = [];
            var data = [];
            for (var i = 0; i < json.length; i++) {
                labels.push(json[i]['jaccardRange']);
                data.push(json[i]['count']);
            }
            console.log(data);
            console.log(labels);
            var myChart = new Chart(canvas1, {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Number of relations',
                        data: data,
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderColor: 'rgba(255,99,132,1)'
                    }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true,
                                stepSize: 1
                            }
                        }]
                    }
                }
            });
        });
});