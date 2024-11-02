'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Swal from 'sweetalert2';

const API_URL = process.env.NEXT_PUBLIC_API_CONTACTOS;

export default function ContactList() {
    const [contacts, setContacts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        phone: '',
    });
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showGif, setShowGif] = useState(false); // Control para mostrar o detener el GIF

    useEffect(() => {
        fetchContacts();
        // Mostrar el GIF después de 1 minuto (60000 ms)
        const timer = setTimeout(() => {
            setShowGif(true);
        }, 60000);
        return () => clearTimeout(timer);
    }, []);

    const fetchContacts = async () => {
        setLoading(true);
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            setContacts(data.reverse());
        } catch (error) {
            console.error('Error fetching contacts:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            email: '',
            name: '',
            phone: '',
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "phone" && isNaN(value)) return; // Restringe a solo números en el campo de teléfono
        setFormData({ ...formData, [name]: value });
    };

    const validateContact = ({ email, name, phone }) => {
        if (!email.includes('@')) {
            Swal.fire('Error', 'Ingrese un email válido', 'error');
            return false;
        }
        if (name.length > 100) {
            Swal.fire('Error', 'El nombre no puede exceder los 100 caracteres', 'error');
            return false;
        }
        if (phone.length < 6 || phone.length > 15) {
            Swal.fire('Error', 'El teléfono debe tener entre 6 y 15 dígitos y solo números', 'error');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const contact = { ...formData };

        if (!validateContact(contact)) return;

        try {
            const res = isEditing
                ? await fetch(`${API_URL}/${contact.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(contact),
                })
                : await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(contact),
                });

            if (res.ok) {
                fetchContacts();
                Swal.fire('Éxito', isEditing ? 'Contacto editado correctamente' : 'Contacto agregado correctamente', 'success');
                setShowModal(false);
                resetForm();
            } else {
                throw new Error('Error al agregar/editar el contacto');
            }
        } catch (error) {
            Swal.fire('Error', error.message, 'error');
        }
    };

    const deleteContact = async (id) => {
        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                fetchContacts();
                Swal.fire('Éxito', 'Contacto eliminado correctamente', 'success');
            } else {
                throw new Error('Error al eliminar el contacto');
            }
        } catch (error) {
            Swal.fire('Error', error.message, 'error');
        }
    };

    const filteredContacts = contacts.filter((contact) =>
        [contact.email, contact.name, contact.phone]
            .join(' ')
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    return (
        <div className="relative flex justify-center items-center min-h-screen bg-black overflow-auto">
            {/* Fondo con GIF o imagen estática */}
            <Image
                src={showGif ? "/fondo.gif" : "/fondo.jpg "}
                alt="Background GIF"
                layout="fill"
                objectFit="cover"
                objectPosition="center"
                className="fixed opacity-100"
                priority
            />

            <div className="relative w-full max-w-5xl z-10  bg-opacity-40 p-6 rounded-lg flex flex-col items-center">
                <div className="flex justify-between items-center mb-6 w-full">
                    <button
                        onClick={() => {
                            resetForm();
                            setShowModal(true);
                            setIsEditing(false);
                        }}
                        className="bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-600 transition duration-300 ease-in-out mt-10"
                    >
                        + Añadir Contacto
                    </button>
                </div>

                {/* Buscador oscuro y centrado */}
                <div className="flex justify-center my-4 w-full">
                    <input
                        type="text"
                        placeholder="Buscar por email, nombre o teléfono"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full max-w-xl px-4 py-2 bg-gray-800 border-2 border-gray-600 text-white rounded-lg focus:outline-none focus:border-indigo-500 transition duration-300 ease-in-out"
                    />
                </div>

                {/* Modal para agregar o editar contactos */}
                {showModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50 overflow-y-auto transition-opacity duration-300">
                        <div className="bg-white rounded-lg p-8 w-full max-w-lg space-y-6 h-auto max-h-screen overflow-y-auto">
                            <h2 className="text-2xl font-bold text-center">{isEditing ? 'Editar Contacto' : 'Añadir Contacto'}</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">Email:</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-green-500 transition duration-300"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">Nombre:</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-green-500 transition duration-300"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">Teléfono:</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-green-500 transition duration-300"
                                        required
                                    />
                                </div>

                                <div className="flex justify-center space-x-4">
                                    <button
                                        type="submit"
                                        className="bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-600 transition duration-300 ease-in-out"
                                    >
                                        {isEditing ? 'Actualizar' : 'Agregar'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            resetForm();
                                        }}
                                        className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition duration-300 ease-in-out"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Lista de contactos */}
                <div className="min-h-20 py-10 p-10 w-full">
                    <h2 className="text-3xl font-bold mb-6 text-center text-gray-200 font-serif tracking-wide">Lista de Contactos</h2>

                    {loading ? (
                        <div className="flex justify-center items-center">
                            <p className="text-xl font-semibold text-gray-200">Cargando...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
                            {filteredContacts.map((contact) => (
                                <div
                                    key={contact.id}
                                    className="bg-gray-900 text-white shadow-lg rounded-lg p-6 flex flex-col justify-between hover:shadow-xl transition-shadow duration-300 ease-in-out max-w-sm mx-auto"
                                >
                                    <div className="mb-4">
                                        <p className="text-xl font-semibold text-center font-serif tracking-wide">{contact.name}</p>
                                        <p className="text-gray-300 text-center">Email: {contact.email}</p>
                                        <p className="text-gray-300 text-center">Teléfono: {contact.phone}</p>
                                    </div>
                                    <div className="flex justify-center space-x-4">
                                        <button
                                            onClick={() => {
                                                setFormData(contact);
                                                setIsEditing(true);
                                                setShowModal(true);
                                            }}
                                            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-300"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => deleteContact(contact.id)}
                                            className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition duration-300"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
