export const bootstrapFixture = {
  site: {
    id: 101,
    name: "Van Mieu Quoc Tu Giam",
  },
  bootstrap_version: "site-101-published-20260501T083000Z",
  published_at: "2026-05-01T08:30:00Z",
  pois: [
    { id: 1, site_id: 101, lat: 21.0287, lng: 105.8357, trigger_radius: 5 },
    { id: 2, site_id: 101, lat: 21.0288, lng: 105.8359, trigger_radius: 5 },
    { id: 3, site_id: 101, lat: 21.0291, lng: 105.8362, trigger_radius: 5 },
  ],
  translations: [
    {
      poi_id: 1,
      language: "vi",
      name: "Khue Van Cac",
      description: "Khue Van Cac la bieu tuong noi bat cua Van Mieu.",
      audio_url: "https://cdn.example.com/audio/khue-van-cac-vi.mp3",
    },
    {
      poi_id: 1,
      language: "en",
      name: "Khue Van Pavilion",
      description: "A signature icon of Van Mieu.",
      audio_url: "https://cdn.example.com/audio/khue-van-cac-en.mp3",
    },
    {
      poi_id: 2,
      language: "vi",
      name: "Dai Trung Mon",
      description: "Cong vao khu chinh cua di tich.",
      audio_url: "https://cdn.example.com/audio/dai-trung-mon-vi.mp3",
    },
    {
      poi_id: 3,
      language: "vi",
      name: "Khu bia tien si",
      description: "Diem tham quan nay chua co audio ngon ngu hien tai.",
      audio_url: null,
    },
  ],
  tours: [
    {
      id: 10,
      site_id: 101,
      name: "Tour co ban",
      poi_ids: [1, 2, 3],
    },
  ],
  app_config: {
    default_language: "vi",
    supported_languages: ["vi", "en"],
    trigger_radius_m: 5,
    exit_radius_m: 7,
    debounce_seconds: 2,
    replay_distance_m: 100,
    chatbot_timeout_ms: 3000,
    chatbot_retry_count: 1,
    gps_poll_interval_seconds: 2,
  },
};
