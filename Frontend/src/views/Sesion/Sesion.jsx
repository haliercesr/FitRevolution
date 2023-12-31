import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getTrainers, getDeportistas, setusuario,trainerPerfil,userPerfil } from "../../components/redux/actions/actions.js";
import validate from "./validate.js";
import { callLoginGoogle, callLoginFacebook } from "../../utils/authFunctions";
import axios from "axios";
import { URLSERVER } from "../../../configURL.js";
import Swal from 'sweetalert2';
import verificationEmailAccount from "../../utils/verificationEmailAccount.js";
import verificationEmail from "../../utils/verificationEmail.js";
import { auth } from "../../components/firebase/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { IoLogoFacebook } from "react-icons/io";
import { FcGoogle } from "react-icons/fc";
import {
    Button,
    TextField,
    Typography,
    Container,
    Grid,
    IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import style from './Sesion.module.css'
import LoadingComponent from '../../components/loading/loading.component.jsx'

const FormSesion = (props) => {
    const { typeSession } = useParams();
    const [form, setForm] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const dispatch = useDispatch();
    const navigate = useNavigate()
    const allTrainers = useSelector((state) => state.allTrainers);
    const allDeportistas = useSelector((state) => state.allDeportistas);
    const trainer=useSelector((state)=>state.trainer)
    const usuario=useSelector((state)=>state.usuario)
    const [loading,setLoading]=useState(false)
   // const [userEmail,setUserEmail]=useState("")
    

    useEffect(() => {
        console.log(allTrainers);
        console.log(allDeportistas);

        axios(`${URLSERVER}/fitevolution/trainers/allTrainer`).then(({ data }) => {
            dispatch(getTrainers(data));
        });

        axios(`${URLSERVER}/fitevolution/clients`).then(({ data }) => {
            dispatch(getDeportistas(data));
        });
    }, [usuario,trainer]);

    const call_login_google = async (e) => {
        e.preventDefault();
        setLoading(true)  //loading de carga
        let userEmail=""   //se dio valor a la variable por referencia, en el try se asigna un nuevo valor pero como la variable no existe en ese scope se busca en el scope anterior y asi. Cuando se encuentra la variable se actualizar y se puede usar en el bloque catch
        try {
            const user = await callLoginGoogle();
            userEmail=user.email
            console.log(user.email)
            if (typeSession === "Deportistas") {
                //primero buscamos si el email existe en nuestra base de datos 
                verificationEmailAccount(allTrainers, "Deportistas", user)
                //----------------------------------------------------------
                await axios.post(`${URLSERVER}/fitevolution/clients`, { email: user.email, surname: user.displayName.split(" ")[1], forename: user.displayName.split(" ")[0] })
                await dispatch(userPerfil(userEmail))
                await navigate('/homeusuario') 
                usuario.forename && Swal.fire(`Bienvenido ${usuario.forename} a FitRevolution`)
                //Swal.fire(`Bienvenido a FitRevolution!! `)
                
            }
            if (typeSession === "Entrenadores") {
                //primero buscamos si el email existe en nuestra base de datos 
                verificationEmailAccount(allDeportistas, "Entrenadores", user)
                //----------------------------------------------------------
                await axios.post(`${URLSERVER}/fitevolution/trainers`, { email: user.email, surname: user.displayName.split(" ")[1], forename: user.displayName.split(" ")[0], puntuaciones: [] })
                await dispatch(trainerPerfil(userEmail))
                console.log(userEmail)
                await navigate('/dashboardtr')
                trainer.forename && trainer.status && trainer.status === "Active" && Swal.fire(`Bienvenido ${trainer.forename} a FitRevolution`)
                //Swal.fire(`Bienvenido a FitRevolution!! `)
                
            }
        } catch (error) {
            const requestData = error.config ? JSON.parse(error.config.data) : null;
            const forename = requestData ? requestData.forename : null;
            

            if (error.code && error.code === "auth/account-exists-with-different-credential") {
                Swal.fire("el email ya existe, prueba iniciar sesion con otro metodo", '', 'error')
                setLoading(false)   //loading de carga 
            }
            if (error.response && error.response.data.error === "El usuario ya esta registrado" && typeSession === "Deportistas") {
                await dispatch(userPerfil(userEmail))
                await navigate('/homeusuario')
                usuario.forename && Swal.fire(`Bienvenido nuevamente ${usuario.forename} `)
                //Swal.fire(`Bienvenido nuevamente!! `)
                
            }
            else if (error.response && error.response.data.error === "El usuario ya esta registrado" && typeSession === "Entrenadores") {
                await dispatch(trainerPerfil(userEmail))
                console.log(userEmail)
                setLoading(false)   //loading de carga
                trainer.forename && navigate('/dashboardtr')
                trainer.status && trainer.status === "Active" && Swal.fire(`Bienvenido ${trainer.forename} a FitRevolution`)
                //Swal.fire(`Bienvenido nuevamente!! `)
                
            }
            else if (error) {
                setLoading(false)   //loading de carga
                Swal.fire(error.message, '', 'error')}
        }
    }


    const call_login_facebook = async (e) => {
        e.preventDefault();
        setLoading(true)  //loading de carga
        let userEmail=""
        try {
            const user = await callLoginFacebook();
            userEmail=user.email
            console.log(user)
            if (typeSession === "Deportistas") {
                //primero buscamos si el email existe en nustra base de datos 
                verificationEmailAccount(allTrainers, "Deportistas", user)
                console.log(user)
                //----------------------------------------------------------
                await axios.post(`${URLSERVER}/fitevolution/clients`, { email: user.email, surname: user.displayName.split(" ")[1], forename: user.displayName.split(" ")[0] })
                await dispatch(userPerfil(userEmail))
                await navigate('/homeusuario')
                usuario.forename && Swal.fire(`Bienvenido ${usuario.forename} a FitRevolution `, '', 'success')
                //Swal.fire(`Bienvenido a FitRevolution!! `)
               
            }
            if (typeSession === "Entrenadores") {
                //primero buscamos si el email existe en nustra base de datos 
                verificationEmailAccount(allDeportistas, "Entrenadores", user)
                //----------------------------------------------------------
                await axios.post(`${URLSERVER}/fitevolution/trainers`, { email: user.email, surname: user.displayName.split(" ")[1], forename: user.displayName.split(" ")[0], puntuaciones: [] })
                await dispatch(trainerPerfil(userEmail))
                await navigate('/dashboardtr')
                trainer.forename && trainer.status && trainer.status === "Active" && Swal.fire(`Bienvenido ${trainer.forename} a FitRevolution`, "", 'success')
                //Swal.fire(`Bienvenido a FitRevolution!! `)
                
            }
        } catch (error) {
            const requestData = error.config ? JSON.parse(error.config.data) : null;
            const forename = requestData ? requestData.forename : null;
            

            if (error.code && error.code === "auth/account-exists-with-different-credential") {
                setLoading(false)   //loading de carga
                Swal.fire("el email ya existe, prueba iniciar sesion con otro metodo", '', 'error')}
            if (error.response && error.response.data.error === "El usuario ya esta registrado" && typeSession === "Deportistas") {
                await dispatch(userPerfil(userEmail))
                await navigate('/homeusuario')
                setLoading(false)   //loading de carga
                usuario.forename && Swal.fire(`Bienvenido nuevamente ${usuario.forename}  `)
                //Swal.fire(`Bienvenido nuevamente!! `)
                
            }
            else if (error.response && error.response.data.error === "El usuario ya esta registrado" && typeSession === "Entrenadores") {
               await dispatch(trainerPerfil(userEmail))
               await navigate('/dashboardtr')
               setLoading(false)   //loading de carga
               trainer.forename && trainer.status && trainer.status === "Active" && Swal.fire(`Bienvenido ${trainer.forename} a FitRevolution `)
               //Swal.fire(`Bienvenido nuevamente!! `)
                
                
            }
            else if (error) {
                setLoading(false)   //loading de carga
                Swal.fire(error.message, '', 'error')}
        }
    } 

    const handleSubmit = async (e) => {
        e.preventDefault()
        //  navigate('/homeusuario')
        //  navigate('/dashboardtr')
        if(form.email==="cesarhalier@gmail.com" && form.password==="Cesar123!") return navigate('/sessionadm')
        if(form.email==="haliercesr@gmail.com" && form.password==="Cesar123!") return navigate('/owner')

        const checkErr = validate(form)
        if (Object.values(form).some(inp => inp === "")) {  //some comprueba si algun elemento del array es "", si hay un "" quiere decir que hay un input vacio
            Swal.fire('DEBÉS COMPLETAR TODOS LOS CAMPOS!', "", 'error');
            return;
        }

        if (Object.values(checkErr).some(error => error)) {
            Swal.fire('EL FORMULARIO CONTIENE ERRORES!', "", "error");
            return;
        }

        try {

            verificationEmail(form.email, allTrainers, allDeportistas, typeSession)
            const credentials = await signInWithEmailAndPassword(auth, form.email, form.password)
            Swal.fire(`Bienvenido: ${credentials.user.email}`)
            if (typeSession === "Deportistas") {
                navigate('/homeusuario')
            }
            if (typeSession === "Entrenadores") navigate('/dashboardtr')
            console.log(credentials.user.email)
        } catch (error) {

            //  window.alert(error.code)
            if (error.code === "auth/invalid-login-credentials" || error.code === "auth/invalid-login-credentials") Swal.fire("Usuario y/o contraseña invalidos", '', 'error')
            if (error) Swal.fire(error.message, '', 'error')
        }
    }

    //-------

    const handleChange = (e) => {
        e.preventDefault();
        const property = e.target.name;
        const value = e.target.value;

        setForm((previo) => {
            const newS = {
                ...previo,
                [property]: value,
            };
            setErrors(validate(newS));
            return newS;
        });
    };

    const volverinicio = (e) => {
        navigate("/");
    };

    const invitado = (option) => {
        dispatch(setusuario(option));
        navigate("/homeusuario");
    };

    const typeAccount = () => {
        if (typeSession === "Deportistas") navigate(`/registeruser/`);
        if (typeSession === "Entrenadores") navigate(`/registertrainer/`);
    };

    return (<div className={style.FormSesion}>
        {loading===true && <LoadingComponent/>}
        <Container className={style.Form} component="main" maxWidth="xs">
            <div>
                <div className={style.btconteiner} >
                    <IconButton onClick={volverinicio}>
                        <ArrowBackIcon />
                        <Typography component="h6" >
                            Volver al inicio
                        </Typography>
                    </IconButton>
                    {typeSession && typeSession === "Deportistas" && <IconButton onClick={() => invitado("invitado")}>
                        <Typography component="h6">
                            Ingresar como invitado
                        </Typography>
                        <ArrowBackIcon style={{ transform: "rotate(180deg)" }} />
                    </IconButton>}
                </div>
                <Typography component="h1" variant="h5">
                    {typeSession}
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        id="email"
                        label="Correo electrónico"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        onChange={handleChange}
                    />
                    {errors.email && (
                        <Typography variant="body2" color="error">
                            {errors.email}
                        </Typography>
                    )}
                    <TextField
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        name="password"
                        label="Contraseña"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        onChange={handleChange}
                    />
                    {errors.password && (
                        <Typography variant="body2" color="error">
                            {errors.password}
                        </Typography>
                    )}
                    <Button type="submit" fullWidth variant="contained" color="primary">
                        Iniciar Sesión
                    </Button>
                </form>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                           <Button
                            className={style.Face}
                            fullWidth
                            variant="contained"
                            color="primary"
                            onClick={call_login_facebook}
                        >
                            <IoLogoFacebook size={40} />
                            Continuar con Facebook
                        </Button> 
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Button
                            className={style.google}
                            fullWidth
                            variant="contained"
                            color="primary"
                            onClick={call_login_google}
                        >
                            <FcGoogle size={40} />
                            Continuar con Google
                        </Button>
                    </Grid>
                </Grid>
                <Typography>
                    ¿Olvidaste tu contraseña?
                    <Link to={"/forgot_Password"}> Haz clic aquí</Link>
                </Typography>
                <Typography>
                    ¿No tienes una cuenta?
                    <Button
                        fullWidth
                        variant="outlined"
                        color="primary"
                        onClick={typeAccount}
                    >
                        Haz clic aquí
                    </Button>
                </Typography>
            </div>
        </Container>
    </div>);
};

export default FormSesion;







