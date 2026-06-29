import { useEffect, useState } from "react";
import {
  obtenerIncidentes,
  crearIncidente,
  obtenerHistorial,
  cambiarEstado,
} from "./services/api";

function App() {
  const [incidentes, setIncidentes] = useState([]);
  const [error, setError] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [busquedaOficina, setBusquedaOficina] = useState("");
  const [historial, setHistorial] = useState([]);
  const [incidenteSeleccionado, setIncidenteSeleccionado] = useState(null);

  const [nuevoIncidente, setNuevoIncidente] = useState({
    descripcion: "",
    oficina: "",
    claseAviso: "",
    prioridad: "Alta",
    usuarioReporta: "",
    fechaReporte: "",
    incidentePadreId: "",
  });

  useEffect(() => {
    cargarIncidentes();
  }, []);

  async function cargarIncidentes() {
    try {
      const data = await obtenerIncidentes();

      console.log("Datos recibidos:", data);

      setIncidentes(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  }

  function determinarClaseAviso(descripcion) {
    const texto = descripcion.toLowerCase();

    if (
      texto.includes("contadora") ||
      texto.includes("fajos") ||
      texto.includes("billetes") ||
      texto.includes("monedas") ||
      texto.includes("ultravioleta")
    ) {
      return "EQUIPOS DE OFICINA";
    }

    if (
      texto.includes("aire acondicionado") ||
      texto.includes("ups") ||
      texto.includes("planta electrica")
    ) {
      return "EQUIPOS ELECTROMECANICOS";
    }

    if (
      texto.includes("pintura") ||
      texto.includes("baño") ||
      texto.includes("bano") ||
      texto.includes("puerta") ||
      texto.includes("cajonera")
    ) {
      return "LOCATIVO";
    }

    if (
      texto.includes("cofre") ||
      texto.includes("dial") ||
      texto.includes("alarma")
    ) {
      return "SEGURIDAD";
    }

    if (
      texto.includes("nevera") ||
      texto.includes("microondas") ||
      texto.includes("mesa")
    ) {
      return "MUEBLES Y ENSERES";
    }

    return "OTROS";
  }

  async function guardarIncidente() {
    try {
      const incidenteAEnviar = {
        ...nuevoIncidente,

        descripcion: nuevoIncidente.descripcion.toUpperCase(),

        claseAviso: nuevoIncidente.claseAviso.toUpperCase(),

        oficina: `OF${String(nuevoIncidente.oficina).padStart(3, "0")}`,

        incidentePadreId:
          nuevoIncidente.incidentePadreId === ""
            ? null
            : Number(nuevoIncidente.incidentePadreId),
      };

      await crearIncidente(incidenteAEnviar);

      await cargarIncidentes();

      setNuevoIncidente({
        descripcion: "",
        oficina: "",
        claseAviso: "",
        prioridad: "Alta",
        usuarioReporta: "",
        fechaReporte: "",
        incidentePadreId: "",
      });

      alert("Incidente creado correctamente");
    } catch (error) {
      console.error(error);
      alert("Error al crear incidente");
    }
  }

  async function mostrarHistorial(id) {
    try {
      const historialData = await obtenerHistorial(id);

      setHistorial(historialData);
      setIncidenteSeleccionado(id);
    } catch (error) {
      console.error(error);

      alert("Error obteniendo historial");
    }
  }

  async function resolverIncidente(id) {
    try {
      await cambiarEstado(id, "Resuelto");

      await cargarIncidentes();
    } catch (error) {
      console.error(error);

      alert("Error cambiando estado");
    }
  }

  const totalIncidentes = incidentes.length;

  const pendientes = incidentes.filter(
    (incidente) => incidente.estado === "Pendiente",
  ).length;

  const altaPrioridad = incidentes.filter(
    (incidente) => incidente.prioridad === "Alta",
  ).length;

  const incidentesFiltrados = incidentes.filter((incidente) => {
    const cumpleEstado =
      filtroEstado === "Todos" || incidente.estado === filtroEstado;

    const cumpleOficina = incidente.oficina
      .toLowerCase()
      .includes(busquedaOficina.toLowerCase());

    return cumpleEstado && cumpleOficina;
  });

  return (
    <div className="container mt-4">
      <div className="mb-4">
        <h1>Sistema de Gestión de Incidentes</h1>
        <p className="text-muted">Monitoreo y seguimiento de incidencias</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <h5>Total Incidentes</h5>
              <h2>{totalIncidentes}</h2>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <h5>Pendientes</h5>
              <h2>{pendientes}</h2>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <h5>Alta Prioridad</h5>
              <h2>{altaPrioridad}</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h4 className="mb-3">Nuevo Incidente</h4>

          <div className="row">
            <div className="col-md-6 mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Descripción"
                value={nuevoIncidente.descripcion}
                onChange={(e) => {
                  const descripcion = e.target.value;

                  setNuevoIncidente({
                    ...nuevoIncidente,
                    descripcion: descripcion,
                    claseAviso: determinarClaseAviso(descripcion),
                  });
                }}
              />

              <div className="mt-2">
                <strong>Clase detectada:</strong>

                {nuevoIncidente.claseAviso}
              </div>
            </div>

            <div className="col-md-6 mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Número de oficina (Ej: 1)"
                value={nuevoIncidente.oficina}
                onChange={(e) =>
                  setNuevoIncidente({
                    ...nuevoIncidente,
                    oficina: e.target.value,
                  })
                }
              />
            </div>

            <div className="col-md-6 mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Clase Aviso"
                value={nuevoIncidente.claseAviso}
                onChange={(e) =>
                  setNuevoIncidente({
                    ...nuevoIncidente,
                    claseAviso: e.target.value,
                  })
                }
              />
            </div>

            <div className="col-md-6 mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Usuario Reporta"
                value={nuevoIncidente.usuarioReporta}
                onChange={(e) =>
                  setNuevoIncidente({
                    ...nuevoIncidente,
                    usuarioReporta: e.target.value,
                  })
                }
              />
            </div>

            <div className="col-md-6 mb-3">
              <input
                type="date"
                className="form-control"
                value={nuevoIncidente.fechaReporte}
                onChange={(e) =>
                  setNuevoIncidente({
                    ...nuevoIncidente,
                    fechaReporte: e.target.value,
                  })
                }
              />
            </div>

            <div className="col-md-6 mb-3">
              <select
                className="form-select"
                value={nuevoIncidente.prioridad}
                onChange={(e) =>
                  setNuevoIncidente({
                    ...nuevoIncidente,
                    prioridad: e.target.value,
                  })
                }
              >
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
              </select>
            </div>

            <div className="col-md-6 mb-3">
              <input
                type="number"
                className="form-control"
                placeholder="Incidente Padre (opcional)"
                value={nuevoIncidente.incidentePadreId}
                onChange={(e) =>
                  setNuevoIncidente({
                    ...nuevoIncidente,
                    incidentePadreId: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <button className="btn btn-primary" onClick={guardarIncidente}>
            Guardar Incidente
          </button>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <h4 className="mb-3">Lista de Incidentes</h4>
          <div className="mb-3">
            <select
              className="form-select"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="Todos">Todos los estados</option>
              <option value="Pendiente">Pendientes</option>
              <option value="Resuelto">Resueltos</option>
            </select>
          </div>
          <div className="row mb-3">
            <div className="col-md-8">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por oficina..."
                value={busquedaOficina}
                onChange={(e) => setBusquedaOficina(e.target.value)}
              />
            </div>

            <div className="col-md-4">
              <button
                className="btn btn-secondary w-100"
                onClick={() => {
                  setFiltroEstado("Todos");
                  setBusquedaOficina("");
                }}
              >
                Limpiar Filtros
              </button>
            </div>
          </div>

          <table className="table table-hover">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Descripción</th>
                <th>Clase Aviso</th>
                <th>Oficina</th>
                <th>Estado</th>
                <th>Prioridad</th>
                <th>Usuario</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {incidentesFiltrados.map((incidente) => (
                <tr key={incidente.id}>
                  <td>{incidente.id}</td>

                  <td>{incidente.descripcion}</td>

                  <td>{incidente.claseAviso?.toUpperCase()}</td>

                  <td>{incidente.oficina}</td>

                  <td>
                    <span
                      className={
                        incidente.estado === "Resuelto"
                          ? "badge bg-success"
                          : "badge bg-warning text-dark"
                      }
                    >
                      {incidente.estado}
                    </span>
                  </td>

                  <td>
                    <span
                      className={
                        incidente.prioridad === "Alta"
                          ? "badge bg-danger"
                          : incidente.prioridad === "Media"
                            ? "badge bg-warning text-dark"
                            : "badge bg-secondary"
                      }
                    >
                      {incidente.prioridad}
                    </span>
                  </td>

                  <td>{incidente.usuarioReporta}</td>

                  <td>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-info btn-sm"
                        onClick={() => mostrarHistorial(incidente.id)}
                      >
                        Historial
                      </button>

                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => resolverIncidente(incidente.id)}
                      >
                        Resolver
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {incidenteSeleccionado && (
        <div className="card mt-4 shadow-sm">
          <div className="card-body">
            <h4>Historial del incidente {incidenteSeleccionado}</h4>

            {historial.length === 0 ? (
              <p>No tiene incidentes relacionados.</p>
            ) : (
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Descripción</th>
                    <th>Estado</th>
                  </tr>
                </thead>

                <tbody>
                  {historial.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.descripcion}</td>
                      <td>{item.estado}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
