import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { mockPOIs } from '../api/mockData';

const ChatbotContext = createContext(null);

function distanceInKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function getUserPosition() {
  if (typeof window === 'undefined' || !navigator.geolocation) return null;

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => resolve(null),
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 5000,
      }
    );
  });
}

export function ChatbotProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Xin chao! Toi la tro ly am thuc. Ban co the hoi ve quan ngon, gia ca, hoac goi y gan ban.',
      timestamp: Date.now(),
    },
  ]);
  const [isSending, setIsSending] = useState(false);

  const sendMessage = useCallback(async (text) => {
    const cleaned = text.trim();
    if (!cleaned) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: cleaned,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsSending(true);

    try {
      const location = await getUserPosition();
      const nearbyPOIs = location
        ? mockPOIs
            .map((poi) => ({
              id: poi.id,
              name: poi.name,
              category: poi.category,
              distanceKm: distanceInKm(location.lat, location.lng, poi.location.lat, poi.location.lng),
            }))
            .sort((a, b) => a.distanceKm - b.distanceKm)
            .slice(0, 5)
        : [];

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: cleaned,
          context: {
            location,
            nearbyPOIs,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Chat service unavailable');
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: data.response || 'Xin loi, toi chua co du lieu de tra loi cau hoi nay.',
          timestamp: Date.now(),
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: 'Khong the ket noi chatbot. Vui long thu lai sau.',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      isOpen,
      setIsOpen,
      messages,
      sendMessage,
      isSending,
      suggestionPrompts: ['Quan ngon gan toi?', 'Mon dac trung la gi?', 'Gia trung binh bao nhieu?'],
    }),
    [isOpen, messages, sendMessage, isSending]
  );

  return <ChatbotContext.Provider value={value}>{children}</ChatbotContext.Provider>;
}

export function useChatbot() {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error('useChatbot must be used inside ChatbotProvider');
  }
  return context;
}
