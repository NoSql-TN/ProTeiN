document.addEventListener("DOMContentLoaded", function (event) {
    var canvas0 = document.getElementById('myChart').getContext('2d');

    const graph0 = fetch('/relations')
        .then(response => response.json())
        .then(json => {
            var labels = [];
            var data = [];
            for (var i = 0; i < json.length; i++) {
                labels.push(json[i]['p.Proteinid']);
                data.push(json[i]['nombreRelations']);
            }

            var myChart = new Chart(canvas0, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Number of relations of the 10 most related proteins',
                        data: data,
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderColor: 'rgba(255,99,132,1)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false, // Disable aspect ratio
                    scales: {
                        xAxes: [{
                            barPercentage: 0.8, // Adjust the width of the bars
                            categoryPercentage: 0.8, // Adjust the space between the bars
                            ticks: {
                                padding: 5 // Update the padding value for left and right margins
                            }
                        }],
                        yAxes: [{
                            ticks: {
                                beginAtZero: true,
                                stepSize: 1,
                                padding: 10 // Add space at the bottom
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
            var labels = [];
            var data = [];
            for (var i = 0; i < json.length; i++) {
                labels.push(json[i]['jaccardRange']);
                data.push(json[i]['count']);
            }

            var myChart = new Chart(canvas1, {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Number of relations',
                        data: data,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 159, 64, 0.2)',
                            'rgba(255, 0, 0, 0.2)',
                            'rgba(0, 255, 0, 0.2)',
                            'rgba(0, 0, 255, 0.2)',
                            'rgba(128, 128, 128, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255,99,132,1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)',
                            'rgba(255, 0, 0, 1)',
                            'rgba(0, 255, 0, 1)',
                            'rgba(0, 0, 255, 1)',
                            'rgba(128, 128, 128, 1)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false, // Disable aspect ratio
                    title: {
                        display: true,
                        text: 'Number of Relations by Jaccard Range' // Add your desired title here
                    },
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
    
    var canvas2 = document.getElementById('myChart2').getContext('2d');

    // [{'jaccardRange': '0.0-0.1', 'nodeCount': 623}, {'jaccardRange': '0.1-0.2', 'nodeCount': 4127}, {'jaccardRange': '0.2-0.3', 'nodeCount': 3102}, {'jaccardRange': '0.3-0.4', 'nodeCount': 2793}, {'jaccardRange': '0.4-0.5', 'nodeCount': 1870}, {'jaccardRange': '0.5-0.6', 'nodeCount': 1433}, {'jaccardRange': '0.6-0.7', 'nodeCount': 1033}, {'jaccardRange': '0.7-0.8', 'nodeCount': 930}, {'jaccardRange': '0.8-0.9', 'nodeCount': 315}, {'jaccardRange': '0.9-1.0', 'nodeCount': 1622}]
    // create the pie chart
    const graph2 = fetch('/jaccardavg')
        .then(response => response.json())
        .then(json => {
            var labels = [];
            var data = [];
            for (var i = 0; i < json.length; i++) {
                labels.push(json[i]['jaccardRange']);
                data.push(json[i]['nodeCount']);
            }

            var myChart = new Chart(canvas2, {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Number of nodes',
                        data: data,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)', 
                            'rgba(255, 206, 86, 0.2)', 
                            'rgba(75, 192, 192, 0.2)', 
                            'rgba(153, 102, 255, 0.2)', 
                            'rgba(255, 159, 64, 0.2)', 
                            'rgba(255, 0, 0, 0.2)', 
                            'rgba(0, 255, 0, 0.2)', 
                            'rgba(0, 0, 255, 0.2)', 
                            'rgba(128, 128, 128, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255,99,132,1)', 
                            'rgba(54, 162, 235, 1)', 
                            'rgba(255, 206, 86, 1)', 
                            'rgba(75, 192, 192, 1)', 
                            'rgba(153, 102, 255, 1)', 
                            'rgba(255, 159, 64, 1)', 
                            'rgba(255, 0, 0, 1)', 
                            'rgba(0, 255, 0, 1)', 
                            'rgba(0, 0, 255, 1)', 
                            'rgba(128, 128, 128, 1)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false, // Disable aspect ratio
                    title: {
                        display: true,
                        text:'Average relations for all proteins' // Add your desired title here
                    },
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
    
    var canvas3 = document.getElementById('myChart3').getContext('2d');

    //[{'numberOfInterPro': 2, 'numberOfProteins': 3056}, {'numberOfInterPro': 3, 'numberOfProteins': 2991}, {'numberOfInterPro': 4, 'numberOfProteins': 3387}, {'numberOfInterPro': 5, 'numberOfProteins': 3293}, {'numberOfInterPro': 6, 'numberOfProteins': 2163}, {'numberOfInterPro': 7, 'numberOfProteins': 1499}, {'numberOfInterPro': 8, 'numberOfProteins': 1008}, {'numberOfInterPro': 9, 'numberOfProteins': 633}, {'numberOfInterPro': 10, 'numberOfProteins': 479}, {'numberOfInterPro': 11, 'numberOfProteins': 363}, {'numberOfInterPro': 12, 'numberOfProteins': 230}, {'numberOfInterPro': 13, 'numberOfProteins': 195}, {'numberOfInterPro': 14, 'numberOfProteins': 114}, {'numberOfInterPro': 15, 'numberOfProteins': 87}, {'numberOfInterPro': 16, 'numberOfProteins': 45}, {'numberOfInterPro': 17, 'numberOfProteins': 39}, {'numberOfInterPro': 18, 'numberOfProteins': 29}, {'numberOfInterPro': 19, 'numberOfProteins': 27}, {'numberOfInterPro': 20, 'numberOfProteins': 16}, {'numberOfInterPro': 21, 'numberOfProteins': 13}, {'numberOfInterPro': 22, 'numberOfProteins': 4}, {'numberOfInterPro': 23, 'numberOfProteins': 2}, {'numberOfInterPro': 24, 'numberOfProteins': 1}, {'numberOfInterPro': 26, 'numberOfProteins': 2}, {'numberOfInterPro': None, 'numberOfProteins': 725}]
    //create the bar chart
    const graph3 = fetch('/interpro')
        .then(response => response.json())
        .then(json => {
            var labels = [];
            var data = [];
            for (var i = 0; i < json.length; i++) {
                labels.push(json[i]['numberOfInterPro']);
                data.push(json[i]['numberOfProteins']);
            }

            var myChart = new Chart(canvas3, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Number of proteins',
                        data: data,
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderColor: 'rgba(255,99,132,1)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false, // Disable aspect ratio
                    title: {
                        display: true,
                        text: 'Number of proteins by number of domains in their interPro list' // Add your desired title here
                    },
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

    var canvas4 = document.getElementById('myChart4').getContext('2d');

    //[{'p.Proteinid': 'P36406', 'nombreRelations': 4256}, {'p.Proteinid': 'O60229', 'nombreRelations': 4206}, {'p.Proteinid': 'O75962', 'nombreRelations': 4196}, {'p.Proteinid': 'P08581', 'nombreRelations': 3714}, {'p.Proteinid': 'P04629', 'nombreRelations': 3562}, {'p.Proteinid': 'O15197', 'nombreRelations': 3528}, {'p.Proteinid': 'P29320', 'nombreRelations': 3528}, {'p.Proteinid': 'P29323', 'nombreRelations': 3528}, {'p.Proteinid': 'P21709', 'nombreRelations': 3528}, {'p.Proteinid': 'P29317', 'nombreRelations': 3526}]
    //create the bar chart
    const graph4 = fetch('/relations')
        .then(response => response.json())
        .then(json => {
            var labels = [];
            var data = [];
            for (var i = 0; i < json.length; i++) {
                labels.push(json[i]['p.Proteinid']);
                data.push(json[i]['nombreRelations']);
            }

            var myChart = new Chart(canvas4, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: '10 Most frequent domains in the interpro list',
                        data: data,
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderColor: 'rgba(255,99,132,1)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false, // Disable aspect ratio
                    scales: {
                        xAxes: [{
                            barPercentage: 0.8, // Adjust the width of the bars
                            categoryPercentage: 0.8, // Adjust the space between the bars
                            ticks: {
                                padding: 5 // Update the padding value for left and right margins
                            }
                        }],
                        yAxes: [{
                            ticks: {
                                beginAtZero: true,
                                stepSize: 1,
                                padding: 10 // Add space at the bottom
                            }
                        }]
                    }
                }
            });
        });

    var canvas5 = document.getElementById('myChart5').getContext('2d');

    //[{'ecNumber': '2.7.11.1', 'frequency': 222}, {'ecNumber': '2.3.2.27', 'frequency': 211}, {'ecNumber': '3.4.19.12', 'frequency': 94}, {'ecNumber': '2.1.1.-', 'frequency': 77}, {'ecNumber': '3.4.21.-', 'frequency': 75}, {'ecNumber': '3.6.4.13', 'frequency': 69}, {'ecNumber': '3.1.-.-', 'frequency': 63}, {'ecNumber': '3.4.24.-', 'frequency': 56}, {'ecNumber': '2.7.10.1', 'frequency': 51}, {'ecNumber': '3.1.3.48', 'frequency': 48}]
    //create the bar chart
    const graph5 = fetch('/ec')
        .then(response => response.json())
        .then(json => {
            var labels = [];
            var data = [];
            for (var i = 0; i < json.length; i++) {
                labels.push(json[i]['ecNumber']);
                data.push(json[i]['frequency']);
            }

            var myChart = new Chart(canvas5, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: '10 Most frequent EC numbers',
                        data: data,
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderColor: 'rgba(255,99,132,1)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false, // Disable aspect ratio
                    scales: {
                        xAxes: [{
                            barPercentage: 0.8, // Adjust the width of the bars
                            categoryPercentage: 0.8, // Adjust the space between the bars
                            ticks: {
                                padding: 5 // Update the padding value for left and right margins
                            }
                        }],
                        yAxes: [{
                            ticks: {
                                beginAtZero: true,
                                stepSize: 1,
                                padding: 10 // Add space at the bottom
                            }
                        }]
                    }
                }
            });
        });

    
    //[{'organism': 'Homo sapiens (Human)', 'interProElement': '', 'frequency': 19676}, {'ecNumber': '2.7.11.1', 'freq': 222}] 
    const tableContainer = document.getElementById('tableContainer');

fetch('/human')
    .then(response => response.json())
    .then(json => {
        const table = document.createElement('table');
        table.classList.add('table');

        // Create table header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const headers = Object.keys(json[0]);

        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Create table body
        const tbody = document.createElement('tbody');

        json.forEach(row => {
            const tr = document.createElement('tr');

            Object.values(row).forEach(value => {
                const td = document.createElement('td');
                td.textContent = value;
                tr.appendChild(td);
            });

            tbody.appendChild(tr);
        });

        table.appendChild(tbody);

        // Append table to the container
        tableContainer.appendChild(table);
    });
    
});


