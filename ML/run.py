# run.py - Separate runner file
import uvicorn

if __name__ == "__main__":
    print("🚀 Starting JolBondhu API server...")
    print("📡 API Documentation: http://127.0.0.1:8000/docs")
    print("🌐 Frontend: http://localhost:3000")
    
    uvicorn.run(
        "index:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )