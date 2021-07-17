import React, {useState} from 'react';
import {css} from '@emotion/react';
import Router from 'next/router';
import Layout from '../components/layout/Layout';
import {Campo, Formulario, InputSubmit, Error} from '../components/ui/Formulario';
// Firebase
import firebase from '../firebase';
// Validaciones
import useValidation from '../hooks/useValidation';
import validarCrearCuenta from '../validacion/validarCrearCuenta';

const INITIAL_STATE = {
    nombre: '',
    email: '',
    password: ''
};

const CrearCuenta = () => {

    const [error, setError] = useState(false);

    const {
        valores,
        errores,
        handleSubmit,
        handleChange,
        handleBlur
    } = useValidation(INITIAL_STATE, validarCrearCuenta, crearCuenta);

    const {nombre, email, password} = valores;

    async function crearCuenta() {
        try {
            await firebase.registrar(nombre, email, password);
            Router.push('/');
        } catch (error) {
            console.error('Hubo un error al crear el usuario', error.message);
            setError(error.message);
        }
    };

    return (
        <div>
            <Layout>
                <>
                    <h1 css={
                        css `
              text-align: center;
              margin-top: 5rem;
            `
                    }>
                        Crear Cuenta
                    </h1>
                    <Formulario onSubmit={handleSubmit}
                        noValidate>
                        <Campo>
                            <label htmlFor="nombre">Nombre</label>
                            <input type="text" id="nombre" placeholder="Tu nombre" name="nombre"
                                value={nombre}
                                onChange={handleChange}
                                onBlur={handleBlur}/>
                        </Campo>
                        {
                        errores.nombre && <Error>{
                            errores.nombre
                        }</Error>
                    }
                        <Campo>
                            <label htmlFor="email">Email</label>
                            <input type="text" id="email" placeholder="Tu email" name="email"
                                value={email}
                                onChange={handleChange}
                                onBlur={handleBlur}/>
                        </Campo>
                        {
                        errores.email && <Error>{
                            errores.email
                        }</Error>
                    }
                        <Campo>
                            <label htmlFor="password">Password</label>
                            <input type="password" id="password" placeholder="Tu password" name="password"
                                value={password}
                                onChange={handleChange}
                                onBlur={handleBlur}/>
                        </Campo>
                        {
                        errores.password && <Error>{
                            errores.password
                        }</Error>
                    }
                        {
                        error && <Error>{error}</Error>
                    }
                        <InputSubmit type="submit" value="Crear Cuenta"/>
                    </Formulario>
                </>
            </Layout>
        </div>
    )
};

export default CrearCuenta;
