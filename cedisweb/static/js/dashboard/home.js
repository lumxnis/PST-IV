document.addEventListener('DOMContentLoaded', function() {

    const today = new Date().toISOString().split('T')[0];
    document.getElementById('fecha_inicio').value = today;
    document.getElementById('fecha_fin').value = today;

    const button = document.querySelector('.btn-success');

    button.addEventListener('click', function() {
        const fechaInicio = document.getElementById('fecha_inicio').value;
        const fechaFin = document.getElementById('fecha_fin').value;

        // Validar fechas
        if (!fechaInicio || !fechaFin) {
            Swal.fire({
                icon: 'warning',
                title: 'Fechas faltantes',
                text: 'Por favor, seleccione ambas fechas',
                confirmButtonText: 'Aceptar'
            });
            return;
        }

        // Validar que la fecha fin no sea anterior a la fecha inicio
        if (fechaFin < fechaInicio) {
            Swal.fire({
                icon: 'error',
                title: 'Fechas no válidas',
                text: 'La fecha fin no puede ser anterior a la fecha inicio',
                confirmButtonText: 'Aceptar'
            });
            return;
        }

        fetch('/contar_examenes_y_resultados_view/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({
                fecha_inicio: fechaInicio,
                fecha_fin: fechaFin
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la solicitud');
            }
            return response.json();
        })
        .then(data => {
            // Actualizar las cajas de resultados
            document.querySelector('.small-box.bg-success .inner h3').textContent = data.resultados_dados;
            document.querySelector('.small-box.bg-primary .inner h3').textContent = data.examenes_realizados;

            // Crear el gráfico de barra con los datos recibidos
            var labels = data.data.map(item => item.examen_nombre);
            var cantidades = data.data.map(item => item.cantidad);

            var ctx = document.getElementById('grafico_examenes').getContext('2d');
            var barChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Exámenes Realizados',
                        data: cantidades,
                        backgroundColor: 'rgba(60,141,188,0.9)',
                        borderColor: 'rgba(60,141,188,0.8)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });

            if (data.examenes_realizados === 0 && data.resultados_dados === 0) {
                Swal.fire({
                    icon: 'info',
                    title: 'Sin Resultados',
                    text: 'No se encontraron exámenes ni resultados en el período especificado.',
                    confirmButtonText: 'Aceptar'
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
});

// Función para obtener el CSRF token de las cookies
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Si esta cookie empieza con el nombre buscado
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}





