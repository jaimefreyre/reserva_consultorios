
Array.prototype.unique=function(a){
  return function(){return this.filter(a)}}(function(a,b,c){return c.indexOf(a,b+1)<0
});

//Entidades globales
Fecha_SETY= {
  Fecha: "FYA + FechaSeteada", 
  Consultorios: [
    {
     Nombre:"Consultorio ",
     Detalle: "string",
     Direccion: "Regla", 
     HLIBRE: [8,9,10,11,12,13,14,15,16,17,18,19,20,21],
     HUSADO: []
    },{
     Nombre:"Consultorio ",
     Detalle: "string",
     Direccion: "Regla", 
     HLIBRE: [8,9,10,11,12,13,14,15,16,17,18,19,20,21],
     HUSADO: []
    },{
     Nombre:"Consultorio ",
     Detalle: "string",
     Direccion: "Regla", 
     HLIBRE: [8,9,10,11,12,13,14,15,16,17,18,19,20,21],
     HUSADO: []
    },{
     Nombre:"Consultorio ",
     Detalle: "string",
     Direccion: "Regla", 
     HLIBRE: [8,9,10,11,12,13,14,15,16,17,18,19,20,21],
     HUSADO: []
    }
  ]
};
Usuario_SETY={
	IDU: "Id usuario",
	NOMBRE: "Nombre Usuario",
	MATRICULA: 545455, /*Matricula Usuario*/
	ESU: "Estado del Usuario",
	TAF: [/*IDT de turnos del usuario anteriores*/],
	TPV: [/*IDT de turnos del usuario pendientes de verificacion*/],
	TV: [/*IDT de turnos del usuario pendientes y verificados*/],
	MAIL: "mail usuario",
	CEL: 0/*Celular Usuario*/
};
Turnos_SETY={
  IDT: "Identificador a partir del turno : consultorio(index donde esta ubicado) +FYAFECHA + HORA",
  IDU: "Id usuario",
  FR: "Fecha de registro",
  FT: "Fecha del turno",
  H: ["Horas del turno"],
  CT:0,
  EST: "Estado del Turno"
};
Soporte_SETY={
	TURNOSREGISTRADOS: [],
	ERRORES: [],
	UF: "FR"
};



/*------------------------------------------------------------------------------------------------AngularJS*/

var app = angular.module('ReservasV1', ['ngMaterial']);

// app.config(['$routeProvider', function($routeProvider) {
//  // Routes will be here
// }]);

app.provider('PIN', [ function(){
	this.$get = function($http){
	//Funciones Globales
		return { 
			SETYFECHA: function (date){ 
			      let fSety = moment(date).format('DDMMYYYY');
			      let fSety2 = 'FYA' + fSety  /*'+ .json'*/;
			      let mes = moment(date).format('MM');
			      let anio = moment(date).format('YYYY');
			      let m2 = parseInt(mes) - 1;
			      let dia = parseInt( moment(date).format('DD') );
			      let sel = "md-0-month-"+anio+"-"+m2+"-" + dia;
			      let resultado = {'archivo': fSety2, 'selector': sel};
			      return resultado
			},

			SETYTURNO: function(CON, STARTDATE, HORA, HORASRESERVADAS, UDU, COSTO ){
				//Hora es la ultima Hora del Turno
				Turnos_SETY.IDT = CON + 'FYA' + moment( STARTDATE ).format('DDMMYYYY');
				Turnos_SETY.UDU = UDU;
				Turnos_SETY.FR = moment( new Date() ).format('DDMMYYYY');
				Turnos_SETY.FT = moment( STARTDATE ).format('DDMMYYYY');
				Turnos_SETY.H.push(HORASRESERVADAS);
				Turnos_SETY.CT += COSTO;
				Turnos_SETY.EST = 'Pendiente Verificacion';
				return Turnos_SETY;
			},
			SETYSOPORTE: function(Error){
				Soporte_SETY.TURNOSREGISTRADOS.push(Turnos_SETY.IDT); 
				Soporte_SETY.UF = Turnos_SETY.FR;
				if(Error){
					Soporte_SETY.ERRORES.push(Error); 
				}
				return Soporte_SETY;
			},

			SETYTURNOSLIBRES: function(SETYFECHA){
				let consultorios = SETYFECHA.Consultorios;
				let libres = [];
				consultorios.forEach(function(x) {
					libres = libres.concat(x.HLIBRE); 
					//libres.push(x.HLIBRE)
				});
				return libres.unique();
			},

			SETYTURNOSLIBRESPORCONSULTORIO: function(SETYFECHA){
				let consultorios = SETYFECHA.Consultorios;
				let libres = [];
				consultorios.forEach(function(x) {
					//libres = libres.concat(x.HLIBRE); 
					libres.push(x.HLIBRE)
				});
				return libres;
			},
			
			SETYCOLOR: function(id, color){
			  document.getElementById(id).children[0].style.backgroundColor = color
			},

			SETYTEXTO: function(id, color){
			  document.getElementById(id).children[0].style.color = color
			},

			MOSTRARDATOS: function(data, error){
				if (error){
					error.reject('Se rechazo y hubo un error');
				}
				console.log(data)
			},

			PETICION: function(accion, archivo, datos){ 
				let config = {
					method: 'POST',
					url : './API-Json/api.php?accion='+accion+'&archivo='+archivo,
					data :  angular.toJson(datos, true)
				}
				return $http(config); 
			}
		};
	};

}])

app.config(function($mdDateLocaleProvider, PINProvider) {
     /**
     * @param date {Date}
     * @returns {string} string representation of the provided date
     */
    $mdDateLocaleProvider.formatDate = function(date) {
      return date ? moment(date).format('L') : '';
    };
    /**
     * @param dateString {string} string that can be converted to a Date
     * @returns {Date} JavaScript Date object created from the provided dateString
     */
    $mdDateLocaleProvider.parseDate = function(dateString) {
      var m = moment(dateString, 'L', true);
      return m.isValid() ? m.toDate() : new Date(NaN);
    };
})

app.controller('UsuarioControlador', ['$scope', 'PIN', '$log', '$q', function($scope, PIN, $log, $q){

	console.log(PIN, Fecha_SETY)

	$scope.titulo = 'Reserva Consultorios';
	let alcance = this;

	//Usuario Testing
	this.e = '';
	this.pw = '';
	this.turnoSesion = [];
	// this.FECHA ={};

  	this.myDate = new Date();
    this.startDate = this.myDate;
  	this.LogOk = false;

	this.onDateChanged = function() {
		$log.log('Updated Date: ', this.myDate);
		// this.seleccionFecha();
	};

	

	this.seleccionFecha = function(){
		console.log('se eligio este valor');
		this.SETYFECHA_ = PIN.SETYFECHA(this.startDate);
		$log.log( this.SETYFECHA_ );

		// document.getElementById(this.SETYFECHA_.selector).style.backgroundColor = 'red';
		// PIN.SETYCOLOR(this.SETYFECHA_.selector, 'red')
		// PIN.SETYTEXTO(this.SETYFECHA_.selector, 'white')
		
		PIN.PETICION('LJSN',this.SETYFECHA_.archivo, Fecha_SETY).then(function(data){
			Fecha_SETY = data.data;
			console.log(Fecha_SETY);
			//console.log( PIN.SETYTURNOSLIBRES( Fecha_SETY ) )
			//console.log(PIN.SETYTURNOSLIBRESPORCONSULTORIO(Fecha_SETY))
			angular.element('#resultados').html('');
			PIN.SETYTURNOSLIBRESPORCONSULTORIO(Fecha_SETY).forEach(function(value, key){
				// console.log(key, value)
				// console.log(Fecha_SETY.Consultorios[key].Nombre)
				let p = '';
				p = p + '<button class="btn btn-primary btn-block botonesClinicas collapsed" type="button" data-toggle="collapse" data-target="#C'+key+'" aria-expanded="false" aria-controls="collapseTwo">'+Fecha_SETY.Consultorios[key].Nombre+ (key+1) +'</button>';
					p = p + '<div id="C'+key+'" class="collapse" aria-labelledby="headingTwo" data-parent="#resultados">';
						p = p + '<div class="">';
							value.forEach( function(v, i){
								p = p + '<button id="H'+v+'C'+key+'" class="btn btn-warning md-fab" aria-label="" onclick="$scope.ctrl.seleccionHora('+v+','+key+','+i+')">'+v+'HRS</button>';
							})
					p = p + '</div></div>';
				angular.element('#resultados').html( angular.element('#resultados').html() + p );
			})
		}, PIN.MOSTRARDATOS);
	
	}

	this.Login = function(){
		console.log(this.e, this.pw)
		if( (this.e =="A@A") && (this.pw =="A") ){
			this.LogOk = true;
		}
		else{
			alert('Error Usuario o Contraseña');
		}
		PIN.PETICION('LJSN','SETY', PIN.SETYSOPORTE() ).then(function(data){
			Soporte_SETY = data.data;
			alcance.TurnosRegistro = Soporte_SETY.TURNOSREGISTRADOS ;
		}, PIN.MOSTRARDATOS)

		//PIN.PETICION('LJSN',this.SETYFECHA_.archivo, Usuario_SETY).then(PIN.MOSTRARDATOS, PIN.MOSTRARDATOS);
	}

	this.seleccionHora = function(v, key, k){
		let IDH = 'H'+v+'C'+key;
		angular.element('#'+IDH).prop('disabled', true);
		alcance.TURNO = PIN.SETYTURNO(IDH, this.startDate, v, IDH, this.e, 10);
		Fecha_SETY.Consultorios[key].HUSADO.push(v);
		Fecha_SETY.Consultorios[key].HLIBRE.splice(Fecha_SETY.Consultorios[key].HLIBRE.indexOf(v), 1);
		console.log(Fecha_SETY)
	}

	this.confirmarTurno = function(){
		
		var deferred = $q.defer();
		
		PIN.PETICION('CJSN',Turnos_SETY.IDT, Turnos_SETY).then(function(data){
			console.log(data);
			Turnos_SETY = data.data;
		    deferred.notify('Guardado Turno');
			//this.seleccionFecha();
		},PIN.MOSTRARDATOS);
		PIN.PETICION('CJSN',this.SETYFECHA_.archivo, Fecha_SETY).then(function(data){
			console.log(data);
			Fecha_SETY = data.data;
		    deferred.notify('Guardada Fecha.');
			//this.seleccionFecha();
		},PIN.MOSTRARDATOS);
		PIN.PETICION('CJSN','SETY', PIN.SETYSOPORTE() ).then(function(data){
			console.log(data);
			Soporte_SETY = data.data;
		    deferred.resolve('Resuelt!');
			//this.seleccionFecha();
		},PIN.MOSTRARDATOS);
		
		deferred.promise.then(function(){
			alert('Salio todo Ok');
		}, PIN.MOSTRARDATOS, PIN.MOSTRARDATOS)

	}


}]);

