export default function Loading() {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh'
        }}>
            <div className="spinner" style={{
                width: '48px',
                height: '48px',
                border: '6px solid #ccc',
                borderTop: '6px solid #007bff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
            }} />
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg);}
                    100% { transform: rotate(360deg);}
                }
            `}</style>
        </div>
    );
}