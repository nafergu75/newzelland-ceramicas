import { useEffect, useState } from 'react'
import { accountService } from '../../../services/accountService'
import { DatosPersonales } from '../../../types/account'

export default function MyProfile() {
  const [datos, setDatos] = useState<DatosPersonales | null>(null)
  const [editando, setEditando] = useState(false)
  const [datosTemporal, setDatosTemporal] = useState<DatosPersonales | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [mostrarCambioContraseña, setMostrarCambioContraseña] = useState(false)
  const [contraseñas, setContraseñas] = useState({ actual: '', nueva: '', confirmar: '' })

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true)
        const data = await accountService.getDatosPersonales()
        setDatos(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
  }, [])

  const handleEditarClick = () => {
    setEditando(true)
    setDatosTemporal(datos)
  }

  const handleGuardar = async () => {
    if (!datosTemporal) return

    try {
      setGuardando(true)
      await accountService.actualizarDatosPersonales(datosTemporal)
      setDatos(datosTemporal)
      setEditando(false)
      alert('Datos actualizados correctamente')
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setGuardando(false)
    }
  }

  const handleCambiarContraseña = async () => {
    if (contraseñas.nueva !== contraseñas.confirmar) {
      alert('Las nuevas contraseñas no coinciden')
      return
    }

    try {
      await accountService.cambiarContraseña(contraseñas.actual, contraseñas.nueva)
      setContraseñas({ actual: '', nueva: '', confirmar: '' })
      setMostrarCambioContraseña(false)
      alert('Contraseña actualizada correctamente')
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
  }

  const handleDescargarDatos = async () => {
    if (!window.confirm('¿Descargar tus datos en formato RGPD?')) return

    try {
      const blob = await accountService.descargarDatos()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'mis-datos.zip'
      link.click()
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
  }

  const handleEliminarCuenta = async () => {
    const confirmacion = window.confirm(
      '⚠️ IMPORTANTE: Esta acción eliminará tu cuenta y todos tus datos de forma irreversible. ¿Estás seguro?'
    )
    if (!confirmacion) return

    const contraseña = window.prompt('Por favor, introduce tu contraseña para confirmar:')
    if (!contraseña) return

    try {
      await accountService.eliminarCuenta(contraseña)
      window.location.href = '/'
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
  }

  if (loading) return <p>Cargando perfil...</p>
  if (error) return <p style={{ color: '#c62828' }}>Error: {error}</p>
  if (!datos) return null

  return (
    <div>
      {/* Datos Personales */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>Datos Personales</h3>
          {!editando && (
            <button
              onClick={handleEditarClick}
              style={{
                padding: '8px 16px',
                backgroundColor: '#2196f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Editar
            </button>
          )}
        </div>

        {editando ? (
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                  Nombre
                </label>
                <input
                  type="text"
                  value={datosTemporal?.nombre || ''}
                  onChange={(e) => setDatosTemporal({ ...datosTemporal!, nombre: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                  Apellidos
                </label>
                <input
                  type="text"
                  value={datosTemporal?.apellidos || ''}
                  onChange={(e) => setDatosTemporal({ ...datosTemporal!, apellidos: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                Email
              </label>
              <input
                type="email"
                value={datosTemporal?.email || ''}
                onChange={(e) => setDatosTemporal({ ...datosTemporal!, email: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={datosTemporal?.telefono || ''}
                  onChange={(e) => setDatosTemporal({ ...datosTemporal!, telefono: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                  Empresa (Opcional)
                </label>
                <input
                  type="text"
                  value={datosTemporal?.empresa || ''}
                  onChange={(e) => setDatosTemporal({ ...datosTemporal!, empresa: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                Calle
              </label>
              <input
                type="text"
                value={datosTemporal?.direccion.calle || ''}
                onChange={(e) =>
                  setDatosTemporal({
                    ...datosTemporal!,
                    direccion: { ...datosTemporal!.direccion, calle: e.target.value },
                  })
                }
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                  Ciudad
                </label>
                <input
                  type="text"
                  value={datosTemporal?.direccion.ciudad || ''}
                  onChange={(e) =>
                    setDatosTemporal({
                      ...datosTemporal!,
                      direccion: { ...datosTemporal!.direccion, ciudad: e.target.value },
                    })
                  }
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                  CP
                </label>
                <input
                  type="text"
                  value={datosTemporal?.direccion.codigoPostal || ''}
                  onChange={(e) =>
                    setDatosTemporal({
                      ...datosTemporal!,
                      direccion: { ...datosTemporal!.direccion, codigoPostal: e.target.value },
                    })
                  }
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleGuardar}
                disabled={guardando}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: guardando ? 'not-allowed' : 'pointer',
                }}
              >
                {guardando ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              <button
                onClick={() => setEditando(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f5f5f5',
                  color: '#333',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <InfoItem label="Nombre" value={datos.nombre} />
            <InfoItem label="Apellidos" value={datos.apellidos} />
            <InfoItem label="Email" value={datos.email} />
            <InfoItem label="Teléfono" value={datos.telefono} />
            <InfoItem label="Empresa" value={datos.empresa || '-'} />
            <InfoItem label="Dirección" value={`${datos.direccion.calle}, ${datos.direccion.ciudad}`} />
          </div>
        )}
      </div>

      {/* Seguridad */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Seguridad</h3>

        {!mostrarCambioContraseña ? (
          <button
            onClick={() => setMostrarCambioContraseña(true)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Cambiar Contraseña
          </button>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                Contraseña Actual
              </label>
              <input
                type="password"
                value={contraseñas.actual}
                onChange={(e) => setContraseñas({ ...contraseñas, actual: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                Nueva Contraseña
              </label>
              <input
                type="password"
                value={contraseñas.nueva}
                onChange={(e) => setContraseñas({ ...contraseñas, nueva: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                Confirmar Nueva Contraseña
              </label>
              <input
                type="password"
                value={contraseñas.confirmar}
                onChange={(e) => setContraseñas({ ...contraseñas, confirmar: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleCambiarContraseña}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Actualizar Contraseña
              </button>
              <button
                onClick={() => setMostrarCambioContraseña(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f5f5f5',
                  color: '#333',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Datos y Cuenta */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Datos y Cuenta</h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={handleDescargarDatos}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ff9800',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Descargar Mis Datos (RGPD)
          </button>
          <button
            onClick={handleEliminarCuenta}
            style={{
              padding: '10px 20px',
              backgroundColor: '#c62828',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Eliminar Mi Cuenta
          </button>
        </div>
      </div>
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>{label}</p>
      <p style={{ fontSize: '14px', color: '#1a1a1a' }}>{value}</p>
    </div>
  )
}
