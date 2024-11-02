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
        <div>
            espere un momento ...
        </div>
    );
}
