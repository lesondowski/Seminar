import React, { useState } from 'react';
import Button from '../common/Button';
import { useLanguage } from '../../utils/i18n/LanguageContext';
import NarrationBlock from '../poi/NarrationBlock';
import {
  StarIcon,
  CloseIcon,
  ImagePlaceholderIcon,
  PriceIcon,
  MapPinIcon,
  DirectionIcon,
  TagIcon,
} from '../common/Icons';

export default function POIDetail({ poi, onClose }) {
  const { t, language } = useLanguage();
  const [imageError, setImageError] = useState(false);

  if (!poi) return null;

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden max-h-96 overflow-y-auto">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{poi.name}</h2>
          <p className="text-blue-100 flex items-center gap-1">
            <StarIcon className="w-4 h-4" />
            {poi.rating || 'N/A'}
          </p>
        </div>
        <button
          onClick={onClose}
          className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-white font-bold"
        >
          <CloseIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Image */}
      <div className="relative bg-gray-200 h-48 overflow-hidden">
        {!imageError ? (
          <img
            src={poi.image || '/placeholder.jpg'}
            alt={poi.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <ImagePlaceholderIcon className="w-10 h-10" />
              </div>
              <p>{t('error')}</p>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Description */}
        <div>
          <h3 className="font-bold text-gray-800 mb-2">📝 {t('poi_description')}</h3>
          <p className="text-gray-700 text-sm">{poi.description}</p>
        </div>

        <NarrationBlock
          narration={poi.narration}
          deviceLanguage={language}
        />

        {/* Price */}
        <div>
          <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
            <PriceIcon className="w-4 h-4" />
            {t('poi_price')}
          </h3>
          <p className="text-lg text-green-600 font-bold">{poi.price}</p>
        </div>

        {/* Category */}
        {poi.category && (
          <div>
            <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2"><TagIcon className="w-4 h-4" /> {t('poi_category')}</h3>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              {poi.category}
            </span>
          </div>
        )}

        {/* Location */}
        {poi.location && (
          <div>
            <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
              <MapPinIcon className="w-4 h-4" />
              {t('map_your_location')}
            </h3>
            <p className="text-gray-700 text-sm">
              Lat: {poi.location.lat}, Lng: {poi.location.lng}
            </p>
          </div>
        )}

        {/* Contact */}
        {poi.phone || poi.website ? (
          <div>
            <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
              <DirectionIcon className="w-4 h-4" />
              {t('nav_account')}
            </h3>
            <div className="space-y-1 text-sm">
              {poi.phone && <p>{t('map_phone')}: {poi.phone}</p>}
              {poi.website && <p>Website: {poi.website}</p>}
            </div>
          </div>
        ) : null}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 p-4 border-t flex gap-2">
        <Button onClick={onClose} variant="secondary" className="flex-1">
          {t('close')}
        </Button>
      </div>
    </div>
  );
}
