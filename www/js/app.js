/* jshint bitwise:true, browser:true, eqeqeq:true, forin:true, globalstrict:true, indent:4, jquery:true,
   loopfunc:true, maxerr:3, noarg:true, node:true, noempty:true, onevar: true, quotmark:single,
   strict:true, undef:true, white:false */
/* global */

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
var status			= {
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
		this.watch();
		FB.init(
		{
			appId				: '1434579543483455',
			//nativeInterface		: CDV.FB,
			useCachedDialogs	: false,
			status				: false
		});
		status.init			= 1;
	},

	/**
	 * Bindea eventos de facebook
	 */
	bind			: function()
	{
		FB.Event.subscribe('auth.statusChange', function()
		{
			status.event.statusChange		= 1;
		});
		FB.Event.subscribe('auth.login', function()
		{
			status.event.login				= 1;
		});
		FB.Event.subscribe('auth.logout', function()
		{
			status.event.logout				= 1;
		});
	},

	/**
	 * Login Facebook
	 */
	login			: function(scope)
	{
		status.loginPending			= 1;
		FB._nativeInterface.login(function(response)
		{
			if ( response.authResponse )
			{
				status.logged			= 1;
				this.info();
			}
			else
			{
				status.loginCancel		= 1;
			}
			status.loginPending		= 0;
		},
		{
			scope: scope || 'email'
		},
		function(e)
		{
			status.loginCancel			= 1;
			status.loginPending			= 0;
		});
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
				status.logged			= 1;
				this.info();
			}
			else if ( response.status === 'not_authorized' )
			{
				status.logged			= 0;
			}
			else
			{
				status.logged			= 0;
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
				status.user.error			= 1;
			}
			else
			{
				status.user.error			= 0;
				status.user.id				= response.id;
				status.user.name			= response.name;
				status.user.first_name		= response.first_name;
				status.user.last_name		= response.last_name;
				status.user.email			= response.email;
			}

			// TODO: guardar usuario
		});
	},

	/**
	 * Desconecta al usuario de la app
	 */
	logout			: function()
	{
		status.loggedOut		= 0;
		FB.logout(function()
		{
			status.loggedOut		= 1;
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
		watch(status, function()
		{
			app.storage(status, 'status');
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
				this.storage(obj[x], 'status.' + x);
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
		// TODO: guardar puntaje
		tiempo		= tiempo || 0;
	}
};

//]]>
