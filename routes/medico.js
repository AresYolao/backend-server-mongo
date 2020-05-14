var express = require('express');
var bcrypt = require('bcryptjs')
var miAutenticacion = require('../middleware/auteticacion')
var app = express();


var Medico = require('../models/medico');

//Consultar Médicos
app.get('/', (request, response, next) => {
    var desde = request.query.desde || 0;
    desde = Number(desde);
    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, medicos) => {
            if (err) {
                return response.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando médicos',
                    errors: err
                });
            }

            Medico.count({}, (err, count) => {

                response.status(200).json({
                    ok: true,
                    medicos: medicos,
                    total: count
                });
            });
        });
});

//Actualizar Médicos
app.put('/:id', miAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar médico',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: `El médico con el id ${id} no existe`,
                errors: { message: 'No existe médico con ese id' }
            });
        }


        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;
        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });
    })
})

//Crear Médicos
app.post('/', miAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear médico',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medico: medicoGuardado,
            usuarioToken: req.usuario
        })
    });
})

//Borrar Médico
app.delete('/:id', miAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar médico',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe médico con ese id',
                errors: { message: 'No existe médico con ese id' }
            });
        }

        return res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });


    });


});

module.exports = app;