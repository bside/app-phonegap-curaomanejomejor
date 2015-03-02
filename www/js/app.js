/* jshint bitwise:true, browser:true, eqeqeq:true, forin:true, globalstrict:true, indent:4, jquery:true,
   loopfunc:true, maxerr:3, noarg:true, node:true, noempty:true, onevar: true, quotmark:single,
   strict:true, undef:true, white:false */
/* global FB, CDV, watch*/

/*!
 * TOMO EL CONTROL - APP FB
 *
 * BrandOn | Inconsciente Digital
 * Alvaro Gonzalez <desarrollo@brandon.cl>
 */

//<![CDATA[
'use strict';

/**
 * Estado app
 */
var estado			= {
		init			: 0,
		event			: {
			statusChange	: 0,
			login			: 0,
			logout			: 0
		},
		loginPending	: 0,
		loginCancel		: 0,
		logged			: 0,
		loggedOut		: 0,
		user			: {
			error			: 0,
			id				: 0,
			name			: '',
			first_name		: '',
			last_name		: '',
			email			: ''
		},
		puntajesOk		: 0,
		puntajes		: {
			0	: { nombre: '', puntaje: '' },
			1	: { nombre: '', puntaje: '' },
			2	: { nombre: '', puntaje: '' },
			3	: { nombre: '', puntaje: '' },
			4	: { nombre: '', puntaje: '' },
			5	: { nombre: '', puntaje: '' },
			6	: { nombre: '', puntaje: '' },
			7	: { nombre: '', puntaje: '' },
			8	: { nombre: '', puntaje: '' },
			9	: { nombre: '', puntaje: '' }
		}
	};

/**
 * Definicion del modulo
 */
var app = {
	/**
	 * Inicializa el SDK de Facebook
	 */
	init			: function()
	{
		app.watch();
		FB.init(
		{
			appId				: '690669987676699',
			nativeInterface		: CDV.FB,
			useCachedDialogs	: false,
			status				: false
		});
		estado.init			= 1;
	},

	/**
	 * Bindea eventos de facebook
	 */
	bind			: function()
	{
		FB.Event.subscribe('auth.statusChange', function()
		{
			estado.event.statusChange		= 1;
		});
		FB.Event.subscribe('auth.login', function()
		{
			estado.event.login				= 1;
		});
		FB.Event.subscribe('auth.logout', function()
		{
			estado.event.logout				= 1;
		});
	},

	/**
	 * Login Facebook
	 */
	login			: function(scope)
	{
		estado.loginPending			= 1;
		//FB._nativeInterface.login(function(response)
		FB.login(function(response)
		{
			if ( response.authResponse )
			{
				estado.logged			= 1;
				app.info();
			}
			else
			{
				estado.loginCancel		= 1;
			}
			estado.loginPending		= 0;
		},
		{
			scope: scope || 'email'
		}
		/*,
		function()
		{
			estado.loginCancel			= 1;
			estado.loginPending			= 0;
		}*/);
	},

	/**
	 * Obtiene el estado de conexion
	 */
	loginStatus		: function()
	{
		FB.getLoginStatus(function(response)
		{
			if ( response.status === 'connected' )
			{
				estado.logged			= 1;
				app.info();
			}
			else if ( response.status === 'not_authorized' )
			{
				estado.logged			= 0;
			}
			else
			{
				estado.logged			= 0;
			}
		}, true);
	},

	/**
	 * Obtiene la informacion del usuario
	 */
	info			: function()
	{
		FB.api('/me',
		{
			fields		: 'id, name, first_name, last_name, email'
		},
		function(response)
		{
			if ( ! response || response.error )
			{
				estado.user.error			= 1;
			}
			else
			{
				estado.user.error			= 0;
				estado.user.id				= response.id;
				estado.user.name			= response.name;
				estado.user.first_name		= response.first_name;
				estado.user.last_name		= response.last_name;
				estado.user.email			= response.email;
			}

			$.post('http://www.appsbrandon.cl/tomoelcontrol/tab-curadomanejomejor/juego/facebook.php',
			{
				facebook_id		: response.id,
				nombre			: response.name,
				email			: response.email
			});
		});
	},

	/**
	 * Desconecta al usuario de la app
	 */
	logout			: function()
	{
		estado.loggedOut		= 0;
		FB.logout(function()
		{
			estado.loggedOut		= 1;
		});
	},

	/**
	 * Compartir
	 */
	share			: function(name, description)
	{
		FB._nativeInterface.dialog(
		{
			method			: 'feed',
			name			: name || '-',
			caption			: '-',
			description		: description || '-',
			link			: 'http://google.cl',
			picture			: 'http://placehold.it/200x200'
		});
		/*
		,function(response)
		{
			if ( ! response || response.error )
			{
				app.debug('Error al obetener datos de usuario');
			}
			else
			{
				app.debug('Share OK');
			}
		},
		function()
		{
			app.debug('Error al compartir.');
		});
		*/
	},

	/**
	 * Observa cambios
	 */
	watch			: function()
	{
		watch(estado, function()
		{
			app.storage(estado, 'estado');
		});
	},

	/**
	 * Setea el estado en localStorage
	 */
	storage			: function(obj, name)
	{
		for ( var x in obj )
		{
			if ( typeof(obj[x]) === 'object' )
			{
				app.storage(obj[x], name + '.' + x);
			}
			else
			{
				if ( obj.hasOwnProperty(x) )
				{
					localStorage.setItem(name + '.' + x, obj[x]);
				}
			}
		}
	},

	/**
	 * Postea el puntaje del usuario al finalizar el juego
	 */
	puntaje			: function(tiempo)
	{
		tiempo		= tiempo || 0;
		if ( estado.user.id !== 0 )
		{
			$.post('http://www.appsbrandon.cl/tomoelcontrol/tab-curadomanejomejor/juego/facebook.php',
			{
				facebook_id		: estado.user.id,
				puntaje			: tiempo
			});
		}
	},

	/**
	 * Obtiene los puntajes y los guarda en localStorage
	 */
	puntajes		: function()
	{
		$.getJSON('http://www.appsbrandon.cl/tomoelcontrol/tab-curadomanejomejor/juego/facebook.php?puntajes', function(data)
		{
			for ( var x in data )
			{
				if ( data.hasOwnProperty(x) )
				{
					estado.puntajes[x].nombre		= data[x].nombre;
					estado.puntajes[x].puntaje		= data[x].puntaje;
				}
			}
			estado.puntajesOk		= Math.random();
		});
	}
};

//]]>
