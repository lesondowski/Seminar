# Product Requirements Document (PRD) v1.0

## WanderScan - Smart Tourism Guide System

---

## Document Information

| Field           | Value                            |
| --------------- | -------------------------------- |
| Product Name    | WanderScan                       |
| Version         | 1.0 (MVP)                        |
| Document Date   | March 2026                       |
| Status          | Draft for Development            |
| Owner           | Product Owner / Business Analyst |
| Target Audience | Dev Team, QA, Stakeholders       |

---

# 1. Executive Summary

## 1.1 Overview

**WanderScan** is a web-based tourism guidance platform that allows users to explore a specific location (district, heritage site, city zone) without needing a human tour guide.

The system integrates:

* GPS-based navigation
* Interactive map
* QR scanning for location-based content
* Progress tracking

Users can navigate through Points of Interest (POIs), scan QR codes at real-world locations, and access rich digital content such as text, media, and 3D models.

---

## 1.2 Goals

### Primary Goal

Provide a self-guided tourism experience using GPS + QR + digital content

### Secondary Goals

* Replace traditional tour guide workflows
* Enhance tourist engagement with interactive content
* Track user progress across locations
* Enable scalable digital tourism infrastructure

---

# 2. Scope Definition

## 2.1 In-Scope (MVP v1.0)

### Module 1: User Access

* No login required (anonymous usage)
* Optional session tracking

---

### Module 2: Map & Location

* Display interactive map
* Show all POIs in selected area
* Detect and update user location (GPS)
* Highlight nearby POIs

---

### Module 3: POI Exploration

* View POIs in:

  * Map view
  * List view
* Click POI to see preview:

  * Name
  * Description
  * Image

---

### Module 4: QR Scan Interaction

* Scan QR at real-world locations
* Validate QR → map to POI
* Display detailed content:

  * Description
  * Images
  * Video
  * 3D model (basic MVP placeholder)

---

### Module 5: Tour Progress Tracking

* Mark POI as completed after scan
* Track visited vs unvisited locations
* Show progress (% completion)

---

### Module 6: Tour Flow

* Start tour
* Navigate between POIs
* Receive suggestion for next POI

---

## 2.2 Out-of-Scope (Future Enhancements)

* AR/VR advanced rendering
* AI chatbot guide (RAG)
* Multi-language support
* Social sharing
* Offline mode
* Gamification (badges, leaderboard)
* Admin dashboard
* Payment / ticket integration

---

# 3. User Personas

## 3.1 Primary Persona

**Name:** Linh Tran
**Age:** 18–35
**Role:** Tourist / Traveler

### Goals

* Explore a location without guide
* Learn history/info of places
* Navigate easily

### Pain Points

* Lack of information at sites
* Hard to follow tour route
* No structured experience

---

# 4. User Stories

| ID     | Module     | User Story                                         | Priority |
| ------ | ---------- | -------------------------------------------------- | -------- |
| US-001 | Map        | As a user, I want to see all POIs on a map         | P0       |
| US-002 | GPS        | As a user, I want the system to detect my location | P0       |
| US-003 | POI        | As a user, I want to view POI details              | P0       |
| US-004 | QR         | As a user, I want to scan QR to access content     | P0       |
| US-005 | Progress   | As a user, I want to mark POI as visited           | P0       |
| US-006 | Navigation | As a user, I want route suggestions                | P1       |
| US-007 | Experience | As a user, I want to view media/3D content         | P1       |

---

# 5. Functional Requirements

## 5.1 Map System

**FR-MAP-001:** Display POIs on map
**FR-MAP-002:** Show user location in real-time
**FR-MAP-003:** Highlight nearby POIs

---

## 5.2 POI System

**FR-POI-001:** View POI details
**FR-POI-002:** Show preview content
**FR-POI-003:** Categorize POIs

---

## 5.3 QR System

**FR-QR-001:** Scan QR code
**FR-QR-002:** Validate QR → POI
**FR-QR-003:** Load POI content

---

## 5.4 Progress Tracking

**FR-PROG-001:** Mark POI completed
**FR-PROG-002:** Track progress
**FR-PROG-003:** Show completion percentage

---

## 5.5 Navigation

**FR-NAV-001:** Suggest next POI
**FR-NAV-002:** Calculate distance (basic)

---

# 6. Acceptance Criteria

### AC-001: View Map

**GIVEN** user opens app
**WHEN** map loads
**THEN** all POIs are displayed

---

### AC-002: Scan QR

**GIVEN** user scans QR
**WHEN** QR is valid
**THEN** POI content is shown

---

### AC-003: Complete POI

**GIVEN** user views POI content
**WHEN** user clicks "Completed"
**THEN** POI is marked visited

---

# 7. Non-Functional Requirements

### Performance

* Load map < 2s
* QR scan response < 1s

### Usability

* Mobile-friendly UI
* Simple navigation

### Reliability

* No duplicate completion
* Accurate GPS tracking

---

# 8. Data Model

## POI

```ts
interface POI {
  id: string
  name: string
  description: string
  latitude: number
  longitude: number
  qrCode: string
  image: string
}
```

---

## User Progress

```ts
interface Progress {
  userId: string
  visitedPOIs: string[]
  completedAt: string
}
```

---

# 9. API Design

### GET /pois

→ Get all POIs

### GET /pois/:id

→ Get POI details

### POST /scan

→ Validate QR

---

# 10. UI/UX

* Map-first design
* Mobile optimized
* Simple scan interaction

---

# 11. Business Rules

* QR must map to valid POI
* Cannot complete POI without scan
* Progress must be unique per POI

---

# 12. Tech Stack

### Frontend

* React + TypeScript
* Mapbox / Leaflet

### Backend

* FastAPI / Node.js

### Database

* PostgreSQL

---

# 13. Risks

| Risk           | Impact | Mitigation    |
| -------------- | ------ | ------------- |
| Fake QR        | High   | Validate QR   |
| GPS inaccurate | Medium | Add threshold |
| User confusion | Medium | Improve UX    |

---

# 14. Future Enhancements

* AI tour guide (RAG)
* 3D/AR objects
* Gamification
* Offline mode

---

# 15. Success Criteria

* User can complete full tour
* QR scan works reliably
* Map navigation accurate

---

# End of Document
