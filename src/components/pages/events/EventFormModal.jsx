import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { addEvent, updateEvent } from '../../../api';
import { FaTimes } from 'react-icons/fa';

Modal.setAppElement('#root'); // accessibility

/* ─────────────────────────────── Validation */
const schema = yup.object({
  date: yup
    .date()
    .required('Date is required')
    .min(
      new Date().toISOString().split('T')[0],
      'Past dates are not allowed'
    ),
  description: yup
    .string()
    .min(10, 'At least 10 characters')
    .required('Description is required'),
  photo: yup.mixed().when('$isEdit', {
    is: true,
    then: s => s, // optional on edit
    otherwise: s => s.required('Image required'),
  }),
});

export default function EventFormModal({ isOpen, onClose, initial, onSuccess }) {
  const isEdit = Boolean(initial?.id);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { date: '', description: '', photo: null },
    context: { isEdit },
  });

  /* reset when initial changes */
  useEffect(() => {
    reset({
      date: initial?.date ?? '',
      description: initial?.description ?? '',
      photo: null,
    });
  }, [initial, reset]);

  /* preview */
  const [preview, setPreview] = useState(initial?.photoUrl || null);
  const fileField = watch('photo');
  useEffect(() => {
    if (fileField && fileField.length) {
      const url = URL.createObjectURL(fileField[0]);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    // eslint-disable-next-line
  }, [fileField]);

  /* submit */
  const onSubmit = async values => {
    try {
      if (isEdit) {
        await updateEvent(initial.id, {
          event_date: values.date,
          description: values.description,
          photo: values.photo?.[0],
        });
      } else {
        await addEvent({
          event_date: values.date,
          description: values.description,
          photo: values.photo[0],
        });
      }
      onSuccess();
      onClose();
    } catch (e) {
      alert(e.detail ?? e.message ?? 'Request failed');
    }
  };

  /* ─────────────────────────────── UI */
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      overlayClassName="modal-overlay-blur"
      className="modal-card-centre"
      closeTimeoutMS={200}
    >
      <button className="modal-close" onClick={onClose} type="button">
        <FaTimes />
      </button>

      <h2>{isEdit ? 'Edit Event' : 'Add New Event'}</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="modal-form">
        {/* date */}
        <label>Date</label>
        <input
          type="date"
          min={new Date().toISOString().split('T')[0]}
          {...register('date')}
        />
        {errors.date && <small className="error">{errors.date.message}</small>}

        {/* description */}
        <label>Description</label>
        <textarea rows={4} {...register('description')} />
        {errors.description && (
          <small className="error">{errors.description.message}</small>
        )}

        {/* photo */}
        <label>
          Photo {isEdit && <em>(leave blank to keep existing)</em>}
        </label>
        <input type="file" accept="image/*" {...register('photo')} />
        {preview && (
          <img src={preview} alt="preview" className="preview-img" />
        )}
        {errors.photo && (
          <small className="error">{errors.photo.message}</small>
        )}

        {/* actions */}
        <div className="modal-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
