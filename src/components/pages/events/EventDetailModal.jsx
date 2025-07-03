import React from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');

export default function EventDetailModal({ isOpen, onClose, event }) {
    if (!event) return null;

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            className="modal-card"
            overlayClassName="modal-overlay"
        >
            <img
                src={event.photo}
                alt={event.title}
                className="detail-image"
                onError={e =>
                (e.target.src =
                    'https://www.testo.com/images/not-available.jpg')
                }
            />
            <h2>{event.title}</h2>
            <p>
                <strong>Date:</strong> {event.date}
            </p>
            <p>{event.description}</p>
            {event.link && (
                <p>
                    <a
                        href={event.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="event-link"
                    >
                        More info
                    </a>
                </p>
            )}
            <button onClick={onClose} className="btn-primary">
                Close
            </button>
        </Modal>
    );
}
