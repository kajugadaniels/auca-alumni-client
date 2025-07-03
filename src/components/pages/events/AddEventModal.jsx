import React, { useState } from 'react';
import Modal from 'react-modal';
import { addEvent } from '../../../api';

Modal.setAppElement('#root');

export default function AddEventModal({ isOpen, onClose }) {
    const [form, setForm] = useState({ event_date: '', description: '' });
    const [photo, setPhoto] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleChange = e => {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    };
    const handleFile = e => setPhoto(e.target.files[0]);

    const handleSubmit = async e => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await addEvent({ ...form, photo });
            onClose();
        } catch (err) {
            alert(err.message || 'Failed to add event.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="Add Event"
            className="modal"
            overlayClassName="overlay"
        >
            <h2>Add New Event</h2>
            <form onSubmit={handleSubmit} className="modal-form">
                <label>Date</label>
                <input
                    type="date"
                    name="event_date"
                    value={form.event_date}
                    onChange={handleChange}
                    required
                />
                <label>Description</label>
                <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    required
                />
                <label>Photo</label>
                <input type="file" accept="image/*" onChange={handleFile} required />
                <div className="modal-actions">
                    <button type="button" onClick={onClose} disabled={submitting}>
                        Cancel
                    </button>
                    <button type="submit" disabled={submitting}>
                        {submitting ? 'Adding…' : 'Add Event'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
