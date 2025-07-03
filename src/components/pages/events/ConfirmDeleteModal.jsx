import React, { useState } from 'react';
import Modal from 'react-modal';
import { deleteEvent } from '../../../api';

Modal.setAppElement('#root');

export default function ConfirmDeleteModal({
    isOpen,
    onClose,
    eventId,
    onSuccess,
}) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            await deleteEvent(eventId);
            onSuccess();
            onClose();
        } catch (e) {
            alert(e.message || 'Delete failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            className="modal-card"
            overlayClassName="modal-overlay"
        >
            <h3>Delete Event</h3>
            <p>Are you sure you want to delete this event? This action is irreversible.</p>
            <div className="modal-actions">
                <button className="btn-secondary" onClick={onClose}>
                    Cancel
                </button>
                <button
                    className="btn-danger"
                    onClick={handleDelete}
                    disabled={loading}
                >
                    {loading ? 'Deleting…' : 'Delete'}
                </button>
            </div>
        </Modal>
    );
}
