const API_URL = "http://localhost:8080/incidentes";

export async function obtenerIncidentes() {
    const response = await fetch(API_URL);

    if (!response.ok) {
        throw new Error("Error al obtener incidentes");
    }

    return response.json();
}

export async function crearIncidente(incidente) {

    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(incidente)
    });

    if (!response.ok) {
        throw new Error("Error al crear incidente");
    }

    return response.json();
}

export async function obtenerHistorial(id) {

  const response = await fetch(
    `${API_URL}/historial/${id}`
  );

  if (!response.ok) {
    throw new Error("Error al obtener historial");
  }

  return response.json();
}

export async function cambiarEstado(id, estado) {

  const response = await fetch(
    `${API_URL}/${id}/estado?estado=${estado}`,
    {
      method: "PUT"
    }
  );

  if (!response.ok) {
    throw new Error("Error al cambiar estado");
  }

}