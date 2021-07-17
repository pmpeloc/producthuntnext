import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/layout/Layout';
import DetallesProducto from '../components/layout/DetallesProducto';
import { useProducts } from '../hooks/useProducts';

const Buscar = () => {

  const router = useRouter();
  const { query: { q } } = router;

  // Todos los productos
  const { productos } = useProducts('creado');
  const [resultado, setResultado] = useState([]);

  useEffect(() => {
    const busqueda = q.toLowerCase();
    const filtro = productos.filter(producto => {
      return (
        producto.nombre.toLowerCase().includes(busqueda) ||
        producto.descripcion.toLowerCase().includes(busqueda)
      );
    });
    setResultado(filtro);
  }, [q, productos]);

  return (
    <div>
      <Layout>
        <div className="listado-productos">
          <div className="contenedor">
            <ul className="bg-white">
              {resultado.map(producto => (
                <DetallesProducto
                  key={producto.id}
                  producto={producto}
                />
              ))}
            </ul>
          </div>
        </div>
      </Layout>
    </div>
  )
};

export default Buscar;