from typing import Any


def answer_chat(message: str, context: dict[str, Any] | None = None) -> str:
    text = message.lower().strip()
    nearby = (context or {}).get('nearbyPOIs') or []

    if 'gan' in text or 'gần' in text or 'goi y' in text or 'gợi ý' in text:
        if nearby:
            top = ', '.join([poi.get('name', 'POI') for poi in nearby[:3]])
            return f'Gan ban nhat hien co: {top}. Ban muon xem chi tiet quan nao?'
        return 'Toi chua co du lieu vi tri. Ban co the bat GPS de toi goi y chinh xac hon.'

    if 'gia' in text or 'bao nhieu' in text:
        return 'Muc gia pho bien tai khu Vinh Khanh dao dong tu 30.000 den 120.000 VND tuy mon.'

    if 'mon' in text or 'dac trung' in text:
        return 'Mon dac trung: bun cha, pho, com tam, che, va ca phe sua da.'

    return 'Toi da nhan cau hoi cua ban. Hien backend dang o che do chatbot stub (chua bat RAG).'
