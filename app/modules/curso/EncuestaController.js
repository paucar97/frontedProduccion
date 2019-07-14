app.controller('EncuestaController', function ($rootScope, $scope, $location, $cookies, serviceCRUD, serviceUtil) {
    $scope.usuario = $cookies.getObject('usuario');
    $rootScope.user = $scope.usuario;
    $scope.esProfesor = $scope.usuario.profesor;
    if ($scope.usuario == undefined) $location.path('/');
    $scope.curso = $cookies.getObject("cursoActual");
    $scope.actividad = $cookies.getObject("actividadActual");
    $scope.vistaAlumno = $scope.usuario.alumno;
    $scope.listaAl = null;
    $scope.esActGrupal = false;
    $scope.idRub = 0;
    $scope.coTieneNota = false;
    $scope.idActividadUHorario = null;
    $scope.notaAuto = null;
    $scope.auTieneNota = false;
    $scope.falta = false;
    $scope.flgCalificado = false;
    $scope.mostrarAspecto = true;
    $scope.flgCrear=false;
    $scope.flgVer = false;

    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
            confirmButton: 'btn btn-success',
            cancelButton: 'btn btn-danger'
        },
        buttonsStyling: false,
    })
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
    });

    //Como me encuentro en la actividad, el tipo es 1 y el idActividadUHorario es idActividad
    $scope.regEsfuerzo = {
        tipo: 1,
        idActividadUHorario: $scope.actividad.idActividad,
        idUsuarioCreador: $scope.usuario.idUser,
        listaCategorias: []
    };

    $scope.regEsfuerzoHoras = {
        idRegistroEsfuerzo: $scope.regEsfuerzo.idRegistroEsfuerzo,
        idAlumno: null,
        listaCategorias: $scope.regEsfuerzo.listaCategorias
    }

    $scope.hayRegHorasActividad = false;
    $scope.hayRegCategoriasActividad = false;
    //$scope.hayEncuesta=true;

    if ($scope.actividad.tipo == "G") {
        $scope.esActGrupal = true;
    } else {
        $scope.esActGrupal = false;
    }

    $scope.btnListarGrupo = function () {

        var params = {
            idActividad: $scope.actividad.idActividad,
            idUsuario: $scope.usuario.idUser
        }

        serviceCRUD.TypePost('actividad/grupo/lista-integrantes/coevaluacion', params).them(function (res) {
            $scope.listaAl = res.data.lista;
        })
    }

    $scope.elegirNivel = function (nivel, indi, asp) {
        indi.nota = nivel.puntaje;
        asp.nota = 0;
        for (let i = 0; i < asp.listaNotaIndicador.length; i++) {
            asp.nota += asp.listaNotaIndicador[i].nota;
        }
    }

    $scope.marcado = function () {
      
        $scope.flgCalificado = true;
    }

    $scope.btnEvaluacionE = function (tipo) {
        var params = {
            idActividad: $scope.actividad.idActividad,
            idUsuario: $scope.usuario.idUser,
            tipo: tipo
        }

        serviceCRUD.TypePost('actividad/obtener_calificacion_otra_rubrica', params).then(function (res) {
            $scope.rubrica = res.data;
            if (tipo == 2) {
                $scope.rubricaAuto = $scope.rubrica;
                $scope.rubricaCoauto = null;
            } else {
                $scope.rubricaAuto = null;
                $scope.rubricaCoauto = $scope.rubrica;

            }
        })
    }

    $scope.btnEvaluacion = function (tipo) {
        var params = {
            idActividad: $scope.actividad.idActividad,
            tipo: tipo
        }

        serviceCRUD.TypePost('actividad/obtener_rubrica', params).then(function (res) {

            if (res.data.succeed == false) {
                Swal.fire({
                    title: 'Aviso!',
                    text: 'No existe esta evaluación',
                    type: 'warning',
                    confirmButtonText: 'Ok'
                })
                return;
            }
            $scope.rubrica = res.data;
            $scope.idRub = res.data.idRubrica;

            if (tipo == 2) {
                $scope.rubricaAuto = $scope.rubrica;
                $scope.rubricaCoauto = null;
            } else {
                $scope.rubricaAuto = null;
                $scope.rubricaCoauto = $scope.rubrica;

            }
        })
    }

    $scope.listarGrupo = function () {
        let params = {
            idUsuario: $scope.usuario.idUser,
            idActividad: $scope.actividad.idActividad,
        }
        serviceCRUD.TypePost('actividad/grupo/lista-integrantes/coevaluacion', params).then(function (res) {

            $scope.listaAl = res.data;
        })
    }

    $scope.obtenerCo = function () {
        if ($scope.idalumno == 0) {
            $scope.coTieneNota = true;
        } else {
            let params = {
                idActividad: $scope.actividad.idActividad,
                idCalificado: $scope.idalumno,
                idCalificador: $scope.usuario.idUser,
            }

            serviceCRUD.TypePost('coevaluacion/obtener_coevaluacion', params).then(function (res) {
                $scope.rubricaCoauto = res.data;
                console.dir($scope.rubricaCoauto);
                for (let i = 0; i < $scope.rubricaCoauto.listaNotaAspectos.length; i++) {
                    if($scope.rubricaCoauto.listaNotaAspectos[i].tipoClasificacion==3){
                        $scope.rubricaCoauto.listaNotaAspectos[i].nota = $scope.rubricaCoauto.listaNotaAspectos[i].nota==1? true : false;
                    }
                  
                }
                if (res.data.nota == null) {
                    $scope.coTieneNota = false;
                } else {
                    $scope.coTieneNota = true;
                }

            })

        }
    }

    $scope.btnGuardarCo = function () {

        for (let i = 0; i < $scope.rubricaCoauto.listaNotaAspectos.length; i++) {
            if($scope.rubricaCoauto.listaNotaAspectos[i].tipoClasificacion==2){
                if($scope.rubricaCoauto.listaNotaAspectos[i].nota>$scope.rubricaCoauto.listaNotaAspectos[i].puntajeMax){
                    swalWithBootstrapButtons.fire({
                        title: '¡Eror!',
                        text: 'No se pueden ingresar puntajes mayores a los máximos establecidos.',
                        type: 'error',
                    })
                    return;
                }
                
            }
          
        }

        if (formCo.checkValidity()) {
            //cond para no exceder puntaje max

            const swalWithBootstrapButtons = Swal.mixin({
                customClass: {
                    confirmButton: 'btn btn-success',
                    cancelButton: 'btn btn-danger'
                },
                buttonsStyling: false,
            })

            swalWithBootstrapButtons.fire({
                title: 'Está seguro que quiere continuar?',
                text: "No podrá modificar la nota luego",
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Si, continuar',
                cancelButtonText: 'No, cancelar',

            }).then((result) => {
                if (result.value) {
                    swalWithBootstrapButtons.fire(
                        'Listo!',
                        'Se calificó a tu compañero.',
                        'success'
                    )
                    for (let i = 0; i < $scope.rubricaCoauto.listaNotaAspectos.length; i++) {
                        if($scope.rubricaCoauto.listaNotaAspectos[i].tipoClasificacion==3){
                            $scope.rubricaCoauto.listaNotaAspectos[i].nota = $scope.rubricaCoauto.listaNotaAspectos[i].nota ? 1 : 0;
                            console.dir("GA");
                            console.dir($scope.rubricaCoauto.listaNotaAspectos[i].nota);
                        }
                      
                    }
                    let params = {
                        idActividad: $scope.actividad.idActividad,
                        idAlumno: $scope.idalumno,
                        idCalificador: $scope.usuario.idUser,
                        nota: 0,
                        idRubrica: $scope.idRub,
                        flgFalta: 0,
                        listaNotaAspectos: $scope.rubricaCoauto.listaNotaAspectos,
                        flgCompleto: 0,
                    }

                     serviceCRUD.TypePost('coevaluacion/calificar_coevaluacion', params).then(function (res) {

                        $scope.coTieneNota = true;
                        $scope.obtenerCo();
                    }) 
                } else if (
                    // Read more about handling dismissals
                    result.dismiss === Swal.DismissReason.cancel
                ) {
                    swalWithBootstrapButtons.fire(
                        'Se canceló la calificación',

                    )
                }
            })

        }
        else {
            Swal.fire({
                title: 'Error!',
                text: 'Debe llenar todos los puntajes',
                type: 'error',
                confirmButtonText: 'Ok'
            })
            /*  $('#mdCompletar').appendTo("body").modal('show'); */
        }
    }

    /**
     *  $scope.obtenerAuto = function () {
        let params = {
            idActividad: $scope.actividad.idActividad,
            idAlumno: $scope.usuario.idUser,
        }

        serviceCRUD.TypePost('autoevaluacion/obtener_autoevaluacion', params).then(function (res) {
            if (res.data.succeed == false) {
                Swal.fire({
                    title: 'Aviso!',
                    text: 'No existe una autoevaluación',
                    type: 'warning',
                    confirmButtonText: 'Ok'
                })
                $scope.rubricaAuto = null;
            } else {
                $scope.rubricaAuto = res.data;
                if (res.data.nota == null) {
                    $scope.auTieneNota = false;
                    $scope.falta = false;
                    $scope.flgCalificado = false;
                } else {
                    $scope.auTieneNota = true;
                    $scope.falta = true;
                    $scope.flgCalificado = true;
                }
            }
        })
    }
     */
   

    $scope.obtenerAuto = function () {
        
            let aux = {
                idActividad: $scope.actividad.idActividad,
                tipo: 2,
            }

            serviceCRUD.TypePost('actividad/obtener_rubrica', aux).then(function (res) {
                if (res.data.succeed == false) {
                    Swal.fire({
                        title: 'Aviso!',
                        text: 'No existe una autoevaluación',
                        type: 'warning',
                        confirmButtonText: 'Ok'
                    })
                    $scope.rubricaAuto = null;
                } else {
                    let params = {
                        idActividad: $scope.actividad.idActividad,
                        idAlumno: $scope.usuario.idUser,
                    }

                    serviceCRUD.TypePost('autoevaluacion/obtener_autoevaluacion', params).then(function (res) {
                       
                            $scope.rubricaAuto = res.data;
                            console.dir(res.data);          
                                for (let i = 0; i < $scope.rubricaAuto.listaNotaAspectos.length; i++) {
                                if($scope.rubricaAuto.listaNotaAspectos[i].tipoClasificacion==3){
                                    $scope.rubricaAuto.listaNotaAspectos[i].nota = $scope.rubricaAuto.listaNotaAspectos[i].nota==1? true : false;
                                }
                      
                            }
                            if (res.data.succeed == false) {
                                $scope.rubricaAuto = null;
                            } else {
                                $scope.rubricaAuto = res.data;
                                if (res.data.nota == null) {
                                    $scope.auTieneNota = false;
                                
                                    $scope.flgCalificado = false;
                                } else {
                                    $scope.auTieneNota = true;
                                
                                    $scope.flgCalificado = true;
                                }
                            }   
                        
                     
                })

            }

        })
        
    }

    $scope.btnGuardarAutoEvaluacion = function () {

        for (let i = 0; i < $scope.rubricaAuto.listaNotaAspectos.length; i++) {
            if($scope.rubricaAuto.listaNotaAspectos[i].tipoClasificacion==2){
                if($scope.rubricaAuto.listaNotaAspectos[i].nota>$scope.rubricaAuto.listaNotaAspectos[i].puntajeMax){
                    swalWithBootstrapButtons.fire({
                        title: '¡Eror!',
                        text: 'No se pueden ingresar puntajes mayores a los máximos establecidos.',
                        type: 'error',
                    })
                    return;
                }
                
            }
          
        }

        if (formAuto.checkValidity()) {
            const swalWithBootstrapButtons = Swal.mixin({
                customClass: {
                    confirmButton: 'btn btn-success',
                    cancelButton: 'btn btn-danger'
                },
                buttonsStyling: false,
            })

            swalWithBootstrapButtons.fire({
                title: 'Está seguro que quiere continuar?',
                text: "No podrá modificar la nota luego",
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Si, continuar',
                cancelButtonText: 'No, cancelar',

            }).then((result) => {
                if (result.value) {
                    swalWithBootstrapButtons.fire(
                        'Listo!',
                        'success'
                    )
                    for (let i = 0; i < $scope.rubricaAuto.listaNotaAspectos.length; i++) {
                        if($scope.rubricaAuto.listaNotaAspectos[i].tipoClasificacion==3){
                            $scope.rubricaAuto.listaNotaAspectos[i].nota = $scope.rubricaAuto.listaNotaAspectos[i].nota ? 1 : 0;
                            
                        }
                      
                    }
                    let params = {
                        idActividad: $scope.actividad.idActividad,
                        idAlumno: $scope.usuario.idUser,
                        idCalificador: $scope.usuario.idUser,
                        nota: 0,
                        idRubrica: $scope.rubricaAuto.idRubrica,
                        flgFalta:0,
                        listaNotaAspectos: $scope.rubricaAuto.listaNotaAspectos,
                        flgCompleto: 0,
                    }

                    serviceCRUD.TypePost('autoevaluacion/calificar_autoevaluacion', params).then(function (res) {
                        $scope.obtenerAuto();
                        $scope.auTieneNota = true;
                    })
                    
                } else if (
                    result.dismiss === Swal.DismissReason.cancel
                ) {
                    swalWithBootstrapButtons.fire(
                        'Se canceló la calificación',

                    )
                }
            })

        }
        else {
            Swal.fire({
                title: 'Error!',
                text: 'Debe llenar todos los puntajes',
                type: 'error',
                confirmButtonText: 'Ok'
            })
            /*  $('#mdCompletar').appendTo("body").modal('show'); */
        }
    }


    //Como alumno: Registrar Horas
    $scope.btnRegistrarHoras = function () {
        serviceCRUD.TypePost('registro_horas/registrar_horas', $scope.regEsfuerzoHoras).then(function (res) {
            Swal.fire({
                type: 'success',
                title: 'Se registraron las horas correctamente'
            })
            $scope.obtenerRegHorasComoAlumno();
        })
    }

    //Como alumno: Obtener mi registro de horas
    $scope.obtenerRegHorasComoAlumno = function () {
        var params = {
            tipo: 1,
            idActividadUHorario: $scope.actividad.idActividad,
            //esto lo saco del select alumno
            idAlumno: $scope.usuario.idUser
        }
        serviceCRUD.TypePost('registro_horas/obtener_registro_horas_alumno', params).then(function (res) {
            if (res.data.succeed == false) {
                $scope.flgCrear = false;
                $scope.flgVer = false;
                return;
            }
            else {
                console.dir(res.data)
                $scope.regEsfuerzoHoras.idRegistroEsfuerzo = res.data.idRegistroEsfuerzo;
                $scope.regEsfuerzoHoras.tipo = res.data.tipo;
                $scope.regEsfuerzoHoras.idAlumno = $scope.usuario.idUser
                $scope.regEsfuerzoHoras.listaCategorias = res.data.listaCategorias;
                $scope.hayRegHorasActividad = true;
                console.dir($scope.regEsfuerzoHoras.listaCategorias[0].listaRespuestas.length)
                if($scope.regEsfuerzoHoras.listaCategorias[0].listaRespuestas.length > 0){
                    $scope.flgCrear = false;
                    $scope.flgVer = true;
                }
                else{
                    $scope.flgCrear = true;
                    $scope.flgVer = false;
                }
                
            }
            console.dir('flgcrear = ' + $scope.flgCrear)
            console.dir('flgeditar = ' + $scope.flgVer)
        })

    }


    //Como alumno puedo agregar una respuesta a una categoria
    $scope.btnAgregarRespuesta = function (categoria) {
        var pos = $scope.regEsfuerzoHoras.listaCategorias.indexOf(categoria)

        $scope.regEsfuerzoHoras.listaCategorias[pos].listaRespuestas.push({
            descripcion: '',
            horasPlanificadas: null,
            horasReales: null
        })



    }

    //Como alumno: Quitar una respuesta de una categoria
    $scope.btnQuitarRespuesta = function (categoria, respuesta) {
        var pos = $scope.regEsfuerzoHoras.listaCategorias.indexOf(categoria)
        var pos2 = $scope.regEsfuerzoHoras.listaCategorias[pos].listaRespuestas.indexOf(respuesta);
        $scope.regEsfuerzoHoras.listaCategorias[pos].listaRespuestas.splice(pos2, 1)
    }

    function ListarAlumnos() {
        //Si es una actividad grupal
        if ($scope.actividad.tipo == "G") {
            $scope.esActIndividual = false;
            var params = { idActividad: $scope.actividad.idActividad }
            serviceCRUD.TypePost('actividad/alumnos/entregables', params).then(function (res) {
                $scope.listaGrupal = res.data;
            })
            $scope.mostrar = true;
        }
        else { //Si es una actividad individual
            $scope.esActIndividual = true;
            var params = { idActividad: $scope.actividad.idActividad }
            serviceCRUD.TypePost('actividad/alumnos/entregables', params).then(function (res) {
                $scope.listaAl = res.data.lista;
            })
            $scope.mostrar = true;
        }
    }

    function init() {
        if (!$scope.esProfesor) {
            $scope.listarGrupo();
            $scope.obtenerRegHorasComoAlumno();
        }




    }

    init();
})