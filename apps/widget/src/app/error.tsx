'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1>Algo deu errado!</h1>
        <button onClick={() => reset()} style={{
          marginTop: '20px',
          padding: '10px 20px',
          cursor: 'pointer'
        }}>
          Tentar novamente
        </button>
      </div>
    </div>
  )
}
