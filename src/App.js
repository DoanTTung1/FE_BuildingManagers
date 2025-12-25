import React from 'react';
import './styles/App.css';
import BuildingSearch from './components/BuildingSearch';
import Header from './components/Header'; 
import Footer from './components/Footer';

function App() {
  return (
    <div className="App">
       {/* 1. Header chuẩn hiện đại */}
       <Header />

       {/* 2. Nội dung chính */}
       {/* Thêm style padding-top để tránh bị Header che mất nội dung */}
       <main style={{ paddingTop: '100px', minHeight: '100vh', backgroundColor: '#f8fafd' }}>
           <BuildingSearch />
       </main>

       {/* 3. Footer */}
       <Footer />
    </div>
  );
}

export default App;