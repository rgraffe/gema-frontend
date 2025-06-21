import React, { useEffect, useState } from "react"
import { UserCheck, ClipboardPen, Trash2, CirclePlus, X  } from "lucide-react"
import { createGrupoDeTrabajo, getGruposDeTrabajo } from "@/services/gruposDeTrabajo"

interface GrupoTrabajo {
  id: number,
  codigo: string
  nombre: string
  supervisorId: number | null;
}
interface Supervisor {
  id: number;
  nombre: string;
}
const GruposTrabajo: React.FC = () => {
  const [grupos, setGrupos] = useState<GrupoTrabajo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [nuevoGrupo, setNuevoGrupo] = useState({
    codigo: '',
    nombre: '',
    supervisorId: 0
  })

  useEffect(() => {
    const fetchGrupos = async () => {
      try {
        const response = await getGruposDeTrabajo();
        setGrupos(response.data);
        console.log("gurpos",response.data);
      } catch (error:any) {
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchGrupos()
  }, [])

  const supervisores: Supervisor[] = [
    { id: 1, nombre: "Carlos Rodríguez" },
    { id: 2, nombre: "Ana Garcia" },
    { id: 3, nombre: "Miguel Torres" },
    { id: 4, nombre: "Laura Mendoza" },
    { id: 7, nombre: "Sebastián Gomes" }
  ]
  /*
  const grupos: GrupoTrabajo[] = [
    {
      codigo: "SGMREF",
      nombre: "Grupo de Mantenimiento de Refrigeración",
      supervisor: "Carlos Rodríguez",
      miembros: "8 Técnicos",
    },
    {
      codigo: "SGMELE",
      nombre: "Grupo de Mantenimiento Eléctrico",
      supervisor: "Ana Garcia",
      miembros: "6 Técnicos",
    },
    {
      codigo: "SGMINF",
      nombre: "Grupo de Mantenimiento de Infraestructura",
      supervisor: "Miguel Torres",
      miembros: "10 Técnicos",
    },
    {
      codigo: "SGMLOG",
      nombre: "Grupo de Mantenimiento de Logística",
      supervisor: "Laura Mendoza",
      miembros: "5 Técnicos",
    },
    {
      codigo: "SGMMEC",
      nombre: "Grupo de Mantenimiento Mecánico",
      supervisor: "Sebastián Gomes",
      miembros: "5 Técnicos",
    },
  ]*/

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNuevoGrupo(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const supervisorId = nuevoGrupo.supervisorId

      const nuevoGrupoCreado = await createGrupoDeTrabajo({
        codigo: nuevoGrupo.codigo,
        nombre: nuevoGrupo.nombre,
        supervisorId: nuevoGrupo.supervisorId
      });
      
      setGrupos(prev => [...prev, nuevoGrupoCreado.data]);

      setIsModalOpen(false)
      setNuevoGrupo({codigo:'', nombre:'', supervisorId: 0})
    } catch (error: any) {
      alert(`Error al crear el grupo: ${error.message}`);
    }
  }

  if (isLoading) {
    return <div className="p-6 text-center">Cargando grupos de trabajo...</div>
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">Error: {error}</div>
  }

  return (

    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Grupos de Trabajo</h1>

      <button 
        onClick={() => setIsModalOpen(true)}
        className="flex items-center justify-center gap-2 bg-gray-300 hover:bg-gray-400 transition-colors rounded-lg p-4 mb-5 cursor-pointer"
      >
        <CirclePlus/>
        <h2 className="text-xl font-semibold">Crear nuevo</h2>
      </button>
      
      {/* crear nuevo grupo */}
      {isModalOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-90 z-40"
            onClick={() => setIsModalOpen(false)}
          />
          
          {/* Contenedor del modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div 
              className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header del modal */}
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-xl font-semibold">Crear Nuevo Grupo</h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} className="cursor-pointer"/>
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6">
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="codigo">
                    Código
                  </label>
                  <input
                    id="codigo"
                    name="codigo"
                    type="text"
                    value={nuevoGrupo.codigo}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nombre">
                    Nombre del Grupo
                  </label>
                  <input
                    id="nombre"
                    name="nombre"
                    type="text"
                    value={nuevoGrupo.nombre}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="supervisor">
                    Supervisor
                  </label>
                  <select
                    id="supervisor"
                    name="supervisorId"
                    value={nuevoGrupo.supervisorId}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  >
                    <option value="">Seleccione un supervisor</option>
                    {supervisores.map((sup, index) => (
                      <option key={index} value={sup.id}>{sup.nombre}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-md cursor-pointer"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
      
      <div className="overflow-x-auto">

        {/* tabla en dektop */}
        <table className="hidden md:table min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre del Grupo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supervisor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Miembros</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {grupos.map((grupo, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <div className="flex items-center justify-center border-2 border-gray-300 rounded-lg font-bold">
                    {grupo.codigo}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{grupo.nombre}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-green-500" />
                    <span>{grupo.supervisorId}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center justify-center border-2 border-gray-300 rounded-lg bg-gray-200 font-medium">
                    {"----"}
                  </div>
                </td>
                <td className="flex items-center justify-evenly gap-2 px-6 py-4 whitespace-nowrap text-sm">
                  <div className="inline-block p-1 border-2 border-gray-200 rounded-sm">
                    <ClipboardPen className="h-5 w-5 text-blue-500 cursor-pointer" />
                  </div>  
                  <div className="inline-block p-1 border-2 border-gray-200 rounded-sm">
                    <Trash2 className="h-5 w-5 text-red-500 cursor-pointer"/>
                  </div>                
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* cards en movil */}
        <div className="md:hidden space-y-4">
          {grupos.map((grupo, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="border-2 border-gray-300 rounded-lg font-bold px-3 py-1 text-sm">
                    {grupo.codigo}
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-1 border-2 border-gray-200 rounded-sm">
                      <ClipboardPen className="h-5 w-5 text-blue-500" />
                    </button>
                    <button className="p-1 border-2 border-gray-200 rounded-sm">
                      <Trash2 className="h-5 w-5 text-red-500"/>
                    </button>
                  </div>
                </div>
                
                <div>
                  <p className="font-medium text-gray-900">{grupo.nombre}</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <UserCheck className="h-5 w-5 text-green-500" />
                  <span className="text-sm">{grupo.supervisorId}</span>
                </div>
                
                <div className="border-2 border-gray-300 rounded-lg bg-gray-200 font-medium px-3 py-1 inline-block text-sm">
                  {grupo.supervisorId}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default GruposTrabajo