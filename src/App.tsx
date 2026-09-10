import { AnimatePresence, motion } from 'framer-motion'
import {
  CalendarHeart,
  Heart,
  Plus,
  Sparkles,
  Star,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type PhotoItem = {
  id: string
  src: string
  caption: string
}

type TimelineItem = {
  id: string
  date: string
  title: string
  description: string
  image: string
}

const RELATIONSHIP_START = new Date('2023-02-14T00:00:00')
const GIRL_NAME = '[ИМЯ]'
const YOUR_NAME = '[ТВОЁ ИМЯ]'

const PHOTO_STORAGE_KEY = 'birthday-love-photos'
const TIMELINE_STORAGE_KEY = 'birthday-love-timeline'
const REASONS_STORAGE_KEY = 'birthday-love-reasons'

const placeholderPhotos: PhotoItem[] = [
  { id: 'p1', src: 'https://picsum.photos/seed/love-1/600/800', caption: 'Счастливый момент' },
  { id: 'p2', src: 'https://picsum.photos/seed/love-2/600/800', caption: 'Тёплые объятия' },
  { id: 'p3', src: 'https://picsum.photos/seed/love-3/600/800', caption: 'Наша прогулка' },
  { id: 'p4', src: 'https://picsum.photos/seed/love-4/600/800', caption: 'Свидание мечты' },
  { id: 'p5', src: 'https://picsum.photos/seed/love-5/600/800', caption: 'Улыбки вместе' },
  { id: 'p6', src: 'https://picsum.photos/seed/love-6/600/800', caption: 'Нежный вечер' },
]

const placeholderTimeline: TimelineItem[] = [
  {
    id: 't1',
    date: '[дата]',
    title: 'Наше первое свидание',
    description: 'День, когда всё началось и мир стал красивее.',
    image: 'https://picsum.photos/seed/date-1/220/220',
  },
  {
    id: 't2',
    date: '[дата]',
    title: 'Первый поцелуй',
    description: 'Момент, который навсегда в моём сердце.',
    image: 'https://picsum.photos/seed/date-2/220/220',
  },
  {
    id: 't3',
    date: '[дата]',
    title: 'Поездка вместе',
    description: 'Наши приключения и смех до поздней ночи.',
    image: 'https://picsum.photos/seed/date-3/220/220',
  },
  {
    id: 't4',
    date: '[дата]',
    title: 'Особенный момент',
    description: 'Когда я снова понял, как сильно тебя люблю.',
    image: 'https://picsum.photos/seed/date-4/220/220',
  },
]

const placeholderReasons = [
  'Ты делаешь каждый мой день светлее',
  'Твоя улыбка лечит любые тревоги',
  'С тобой уютно даже в тишине',
  'Ты вдохновляешь меня становиться лучше',
  'Твоя доброта бесконечно красива',
  'Ты понимаешь меня с полуслова',
  'С тобой любое место становится домом',
  'Ты умеешь радоваться мелочам',
  'Я люблю твою искренность и нежность',
]

const readLocalStorage = <T,>(key: string, fallback: T): T => {
  const raw = localStorage.getItem(key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

const formatTogetherTime = (startDate: Date) => {
  const diff = Date.now() - startDate.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  return { days, hours, minutes }
}

function App() {
  const [giftOpened, setGiftOpened] = useState(false)
  const [showBurst, setShowBurst] = useState(false)
  const [burstItems, setBurstItems] = useState<
    Array<{ id: number; x: number; y: number; symbol: string }>
  >([])
  const [musicEnabled, setMusicEnabled] = useState(false)
  const [togetherTime, setTogetherTime] = useState(formatTogetherTime(RELATIONSHIP_START))
  const [photos, setPhotos] = useState<PhotoItem[]>(() => readLocalStorage(PHOTO_STORAGE_KEY, placeholderPhotos))
  const [timeline, setTimeline] = useState<TimelineItem[]>(() =>
    readLocalStorage(TIMELINE_STORAGE_KEY, placeholderTimeline),
  )
  const [reasons, setReasons] = useState<string[]>(() => readLocalStorage(REASONS_STORAGE_KEY, placeholderReasons))
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null)
  const [newReason, setNewReason] = useState('')
  const [reasonModalOpen, setReasonModalOpen] = useState(false)
  const [shootingStar, setShootingStar] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [newTimeline, setNewTimeline] = useState({ date: '', title: '', description: '', image: '' })
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setTogetherTime(formatTogetherTime(RELATIONSHIP_START))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    localStorage.setItem(PHOTO_STORAGE_KEY, JSON.stringify(photos))
  }, [photos])

  useEffect(() => {
    localStorage.setItem(TIMELINE_STORAGE_KEY, JSON.stringify(timeline))
  }, [timeline])

  useEffect(() => {
    localStorage.setItem(REASONS_STORAGE_KEY, JSON.stringify(reasons))
  }, [reasons])

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!audioRef.current) return
    if (musicEnabled) {
      audioRef.current.play().catch(() => undefined)
      return
    }
    audioRef.current.pause()
  }, [musicEnabled])

  const petals = useMemo(
    () =>
      Array.from({ length: 16 }, (_, index) => ({
        id: index,
        left: `${(index * 7 + 4) % 100}%`,
        duration: 8 + (index % 6),
        delay: (index % 5) * 1.2,
        size: 10 + (index % 4) * 6,
      })),
    [],
  )

  const heroText = `С Днём Рождения, ${GIRL_NAME}!`

  const handleOpenGift = () => {
    setBurstItems(
      Array.from({ length: 22 }, (_, index) => ({
        id: index,
        x: (Math.random() - 0.5) * 620,
        y: (Math.random() - 0.5) * 420,
        symbol: ['💖', '🌸', '✨'][index % 3],
      })),
    )
    setShowBurst(true)
    setTimeout(() => {
      setGiftOpened(true)
      setShowBurst(false)
      if (musicEnabled) {
        audioRef.current?.play().catch(() => undefined)
      }
    }, 850)
  }

  const addPhotoFiles = (fileList: FileList | null) => {
    if (!fileList) return
    Array.from(fileList).forEach((file) => {
      if (!file.type.startsWith('image/')) return
      const reader = new FileReader()
      reader.onload = () => {
        const src = reader.result
        if (typeof src !== 'string') return
        setPhotos((prev) => [
          {
            id: `${Date.now()}-${Math.random()}`,
            src,
            caption: 'Новый тёплый момент',
          },
          ...prev,
        ])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleTimelineSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!newTimeline.date || !newTimeline.title || !newTimeline.description) return
    setTimeline((prev) => [
      ...prev,
      {
        id: `${Date.now()}`,
        date: newTimeline.date,
        title: newTimeline.title,
        description: newTimeline.description,
        image: newTimeline.image || 'https://picsum.photos/seed/new-moment/220/220',
      },
    ])
    setNewTimeline({ date: '', title: '', description: '', image: '' })
  }

  const handleAddReason = () => {
    const value = newReason.trim()
    if (!value) return
    setReasons((prev) => [value, ...prev])
    setNewReason('')
    setReasonModalOpen(false)
  }

  return (
    <>
      <audio
        ref={audioRef}
        loop
        src="https://cdn.pixabay.com/download/audio/2022/03/10/audio_4721725622.mp3"
      />

      <div className="petals-layer" aria-hidden="true">
        {petals.map((petal) => (
          <span
            key={petal.id}
            className="petal"
            style={{
              left: petal.left,
              animationDuration: `${petal.duration}s`,
              animationDelay: `${petal.delay}s`,
              width: `${petal.size}px`,
              height: `${petal.size + 8}px`,
            }}
          />
        ))}
      </div>

      <AnimatePresence>
        {!giftOpened && (
          <motion.section
            className="start-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8 }}
          >
            <button
              type="button"
              className="music-toggle"
              onClick={() => setMusicEnabled((prev) => !prev)}
              aria-label="Переключить музыку"
            >
              {musicEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>

            <motion.button
              type="button"
              className="gift-button"
              whileTap={{ scale: 0.95 }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              onClick={handleOpenGift}
            >
              🎁 Открыть подарок
            </motion.button>

            <AnimatePresence>
              {showBurst && (
                <motion.div className="burst" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {burstItems.map((item) => (
                    <motion.span
                      key={item.id}
                      className="burst-item"
                      initial={{ x: 0, y: 0, opacity: 1, scale: 0.6 }}
                      animate={{ x: item.x, y: item.y, opacity: 0, scale: 1.4 }}
                      transition={{ duration: 0.9, ease: 'easeOut' }}
                    >
                      {item.symbol}
                    </motion.span>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {giftOpened && (
          <motion.main
            className="page"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
          >
            <section className="hero section" id="hero">
              <button
                type="button"
                className="music-toggle main"
                onClick={() => setMusicEnabled((prev) => !prev)}
                aria-label="Переключить музыку"
              >
                {musicEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>

              <div className="floating-hearts" style={{ transform: `translateY(${scrollY * 0.08}px)` }}>
                <Heart />
                <Heart />
                <Sparkles />
              </div>

              <h1>
                {heroText.split('').map((char, index) => (
                  <motion.span
                    key={`${char}-${index}`}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                  >
                    {char}
                  </motion.span>
                ))}
              </h1>

              <p className="subtitle">Сегодня особенный день • [дата рождения]</p>

              <div className="counter-card">
                <CalendarHeart size={20} />
                <p>
                  Мы вместе уже: <strong>{togetherTime.days}</strong> дней,{' '}
                  <strong>{togetherTime.hours}</strong> часов, <strong>{togetherTime.minutes}</strong> минут
                </p>
              </div>
            </section>

            <motion.section
              className="section love-letter"
              initial={{ opacity: 0, y: 60, rotateX: -18 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.9 }}
            >
              <h2>Моё любовное письмо</h2>
              <p>
                [Здесь будет твой длинный, тёплый и искренний текст-послание. Замени этот placeholder
                на свою историю, воспоминания и самые важные слова для любимой.]
              </p>
            </motion.section>

            <section className="section">
              <div className="section-head">
                <h2>Галерея воспоминаний</h2>
                <button type="button" className="add-button" onClick={() => fileInputRef.current?.click()}>
                  <Plus size={16} /> Добавить фото
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={(event) => addPhotoFiles(event.target.files)}
                />
              </div>

              <div
                className="drop-zone"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault()
                  addPhotoFiles(event.dataTransfer.files)
                }}
              >
                Перетащи фото сюда или нажми «Добавить фото»
              </div>

              <div className="gallery-grid">
                {photos.map((photo, index) => (
                  <motion.button
                    type="button"
                    key={photo.id}
                    className="photo-card"
                    onClick={() => setSelectedPhoto(photo)}
                    whileHover={{ rotate: 0, scale: 1.04 }}
                    style={{ rotate: `${(index % 2 === 0 ? -1 : 1) * ((index % 4) + 1)}deg` }}
                  >
                    <img src={photo.src} alt={photo.caption} />
                    <span>{photo.caption}</span>
                  </motion.button>
                ))}
              </div>
            </section>

            <section className="section timeline-section">
              <h2>Наша история</h2>
              <div className="timeline">
                {timeline.map((item, index) => (
                  <motion.article
                    key={item.id}
                    className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                  >
                    <img src={item.image} alt={item.title} />
                    <div>
                      <time>{item.date}</time>
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </div>
                  </motion.article>
                ))}
              </div>

              <form className="timeline-form" onSubmit={handleTimelineSubmit}>
                <h3>Добавить событие</h3>
                <input
                  placeholder="Дата"
                  value={newTimeline.date}
                  onChange={(event) =>
                    setNewTimeline((prev) => ({
                      ...prev,
                      date: event.target.value,
                    }))
                  }
                />
                <input
                  placeholder="Заголовок"
                  value={newTimeline.title}
                  onChange={(event) =>
                    setNewTimeline((prev) => ({
                      ...prev,
                      title: event.target.value,
                    }))
                  }
                />
                <textarea
                  placeholder="Описание"
                  value={newTimeline.description}
                  onChange={(event) =>
                    setNewTimeline((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                />
                <input
                  placeholder="Ссылка на мини-фото (опционально)"
                  value={newTimeline.image}
                  onChange={(event) =>
                    setNewTimeline((prev) => ({
                      ...prev,
                      image: event.target.value,
                    }))
                  }
                />
                <button type="submit" className="add-button">
                  Добавить
                </button>
              </form>
            </section>

            <section className="section">
              <div className="section-head">
                <h2>Почему я тебя люблю</h2>
                <button type="button" className="add-button" onClick={() => setReasonModalOpen(true)}>
                  Добавить причину
                </button>
              </div>
              <div className="reasons-grid">
                {reasons.map((reason, index) => (
                  <motion.div
                    className="reason-card"
                    key={`${reason}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <span>💗</span>
                    <p>{reason}</p>
                  </motion.div>
                ))}
              </div>
            </section>

            <section className="section wishes">
              <h2>С днём рождения, моя любовь!</h2>
              <p>
                Пусть каждый твой день будет наполнен счастьем, светом и исполнением самых заветных
                желаний.
              </p>
              <button
                type="button"
                className="add-button"
                onClick={() => {
                  setShootingStar(true)
                  setTimeout(() => setShootingStar(false), 1500)
                }}
              >
                <Star size={16} /> Загадать желание
              </button>
              {shootingStar && <span className="shooting-star" aria-hidden="true" />}
            </section>

            <footer className="section footer">
              <Heart size={16} />
              <p>
                С любовью, {YOUR_NAME} ❤️ • {new Date().getFullYear()}
              </p>
            </footer>
          </motion.main>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {reasonModalOpen && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              className="modal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <button className="icon-button" type="button" onClick={() => setReasonModalOpen(false)}>
                <X size={16} />
              </button>
              <h3>Добавить причину</h3>
              <textarea
                value={newReason}
                onChange={(event) => setNewReason(event.target.value)}
                placeholder="Напиши причину..."
              />
              <button type="button" className="add-button" onClick={handleAddReason}>
                Сохранить
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedPhoto && (
          <motion.button
            className="lightbox"
            type="button"
            onClick={() => setSelectedPhoto(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <img src={selectedPhoto.src} alt={selectedPhoto.caption} />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}

export default App
