function App() {
  return (
    // ĐƯA ROUTER RA NGOÀI CÙNG
    <Router>
      <AuthProvider> {/* Bọc AuthProvider bên trong Router */}
        <div className="App" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Header />

          <main style={{ paddingTop: '100px', flex: 1, backgroundColor: '#f8fafd' }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<BuildingSearch />} />
              <Route path="/building/:id" element={<BuildingDetail />} />
              <Route path="/post-building" element={<CreateBuilding />} />

              {/* --- ROUTE CHO ADMIN --- */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<BuildingManager />} />
                <Route path="buildings" element={<BuildingManager />} />
                <Route path="users" element={<UserManager />} />
              </Route>
            </Routes>
          </main>

          <Footer />

          {/* Modal nằm ở đây đã có thể sử dụng navigate() từ AuthContext */}
          <AuthModal />
        </div>
      </AuthProvider>
    </Router>
  );
}