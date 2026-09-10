import { AnimatePresence, motion } from 'framer-motion'
import { CalendarHeart, Check, Heart, Plus, Sparkles, Star, Volume2, VolumeX, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type PhotoItem = { id: string; src: string; caption: string }
type TimelineItem = { id: string; date: string; title: string; description: string; image: string }
type WishItem = { id: string; text: string; completed: boolean }

const RELATIONSHIP_START = new Date('2023-02-14T00:00:00')
const GIRL_NAME = '[ИМЯ]'
const YOUR_NAME = '[ТВОЁ ИМЯ]'
const PHOTO_STORAGE_KEY = 'birthday-love-photos'
const TIMELINE_STORAGE_KEY = 'birthday-love-timeline'
const REASONS_STORAGE_KEY = 'birthday-love-reasons'
const WISH_STORAGE_KEY = 'birthday-love-wishes'

const placeholderPhotos: PhotoItem[] = [
  { id: 'p1', src: 'https://picsum.photos/seed/love-1/600/800', caption: 'Счастливый момент' },
  { id: 'p2', src: 'https://picsum.photos/seed/love-2/600/800', caption: 'Тёплые объятия' },
  { id: 'p3', src: 'https://picsum.photos/seed/love-3/600/800', caption: 'Наша прогулка' },
  { id: 'p4', src: 'https://picsum.photos/seed/love-4/600/800', caption: 'Свидание мечты' },
  { id: 'p5', src: 'https://picsum.photos/seed/love-5/600/800', caption: 'Улыбки вместе' },
  { id: 'p6', src: 'https://picsum.photos/seed/love-6/600/800', caption: 'Нежный вечер' },
]
const placeholderTimeline: TimelineItem[] = [
  { id: 't1', date: '[дата]', title: 'Наше первое свидание', description: 'День, когда всё началось и мир стал красивее.', image: 'https://picsum.photos/seed/date-1/220/220' },
  { id: 't2', date: '[дата]', title: 'Первый поцелуй', description: 'Момент, который навсегда в моём сердце.', image: 'https://picsum.photos/seed/date-2/220/220' },
  { id: 't3', date: '[дата]', title: 'Поездка вместе', description: 'Наши приключения и смех до поздней ночи.', image: 'https://picsum.photos/seed/date-3/220/220' },
  { id: 't4', date: '[дата]', title: 'Особенный момент', description: 'Когда я снова понял, как сильно тебя люблю.', image: 'https://picsum.photos/seed/date-4/220/220' },
]
const placeholderReasons = ['Ты делаешь каждый мой день светлее', 'Твоя улыбка лечит любые тревоги', 'С тобой уютно даже в тишине', 'Ты вдохновляешь меня становиться лучше', 'Твоя доброта бесконечно красива', 'Ты понимаешь меня с полуслова', 'С тобой любое место становится домом', 'Ты умеешь радоваться мелочам', 'Я люблю твою искренность и нежность']
const loveInLanguages = ['Я люблю тебя', 'I love you', 'Je t’aime', 'Ich liebe dich', 'Ti amo', 'Te amo', '愛してる', '사랑해', 'أنا أحبك']

const formatTogetherTime = (startDate: Date) => {
  const diff = Date.now() - startDate.getTime()
  return { days: Math.floor(diff / 86400000), hours: Math.floor((diff / 3600000) % 24), minutes: Math.floor((diff / 60000) % 60) }
}
const sanitizeImageUrl = (value: string) => {
  try { const parsed = new URL(value, window.location.origin); return ['http:', 'https:', 'data:', 'blob:'].includes(parsed.protocol) ? parsed.toString() : '' } catch { return '' }
}
const encodeWish = (wish: string) => btoa(unescape(encodeURIComponent(wish)))
const decodeWish = (wish: string) => { try { return decodeURIComponent(escape(atob(wish))) } catch { return '' } }

function App() {
  const [giftOpened, setGiftOpened] = useState(false)
  const [showBurst, setShowBurst] = useState(false)
  const [burstItems, setBurstItems] = useState<Array<{ id: number; x: number; y: number; symbol: string }>>([])
  const [musicEnabled, setMusicEnabled] = useState(false)
  const [togetherTime, setTogetherTime] = useState(formatTogetherTime(RELATIONSHIP_START))
  const [photos, setPhotos] = useState<PhotoItem[]>(placeholderPhotos)
  const [timeline, setTimeline] = useState<TimelineItem[]>(placeholderTimeline)
  const [reasons, setReasons] = useState<string[]>(placeholderReasons)
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null)
  const [newReason, setNewReason] = useState('')
  const [reasonModalOpen, setReasonModalOpen] = useState(false)
  const [shootingStar, setShootingStar] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [mouseGlow, setMouseGlow] = useState({ x: 50, y: 50 })
  const [wishEditorOpen, setWishEditorOpen] = useState(false)
  const [wishInput, setWishInput] = useState('')
  const [wishStatus, setWishStatus] = useState('')
  const [wishes, setWishes] = useState<WishItem[]>(() => {
    const saved = localStorage.getItem(WISH_STORAGE_KEY)
    if (!saved) return []
    try {
      const parsed = JSON.parse(saved)
      if (!Array.isArray(parsed)) return []
      return parsed.map((item, index) => typeof item === 'string'
        ? { id: `legacy-${index}`, text: decodeWish(item), completed: false }
        : { id: String(item.id ?? `wish-${index}`), text: typeof item.text === 'string' ? item.text : '', completed: Boolean(item.completed) })
        .filter((item) => item.text)
    } catch { return [] }
  })
  const [loveLanguageIndex, setLoveLanguageIndex] = useState(0)
  const [newTimeline, setNewTimeline] = useState({ date: '', title: '', description: '', image: '' })
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => { const timer = setInterval(() => setTogetherTime(formatTogetherTime(RELATIONSHIP_START)), 1000); return () => clearInterval(timer) }, [])
  useEffect(() => { localStorage.setItem(PHOTO_STORAGE_KEY, JSON.stringify(photos)) }, [photos])
  useEffect(() => { localStorage.setItem(TIMELINE_STORAGE_KEY, JSON.stringify(timeline)) }, [timeline])
  useEffect(() => { localStorage.setItem(REASONS_STORAGE_KEY, JSON.stringify(reasons)) }, [reasons])
  useEffect(() => { localStorage.setItem(WISH_STORAGE_KEY, JSON.stringify(wishes.map((wish) => encodeWish(JSON.stringify(wish))))) }, [wishes])
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    const onMove = (event: MouseEvent) => setMouseGlow({ x: (event.clientX / window.innerWidth) * 100, y: (event.clientY / window.innerHeight) * 100 })
    window.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('mousemove', onMove)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('mousemove', onMove) }
  }, [])
  useEffect(() => { if (!audioRef.current) return; musicEnabled ? audioRef.current.play().catch(() => undefined) : audioRef.current.pause() }, [musicEnabled])
  useEffect(() => { const timer = setInterval(() => setLoveLanguageIndex((prev) => (prev + 1) % loveInLanguages.length), 2000); return () => clearInterval(timer) }, [])

  const petals = useMemo(() => Array.from({ length: 18 }, (_, index) => ({ id: index, left: `${(index * 7 + 4) % 100}%`, duration: 8 + (index % 6), delay: (index % 5) * 1.2, size: 10 + (index % 4) * 6 })), [])
  const heroText = `С Днём Рождения, ${GIRL_NAME}!`
  const heroChars = useMemo(() => heroText.split(''), [heroText])
  const rotatingLoveText = loveInLanguages[loveLanguageIndex]
  const completedWishes = wishes.filter((wish) => wish.completed).length

  const handleOpenGift = () => {
    setBurstItems(Array.from({ length: 28 }, (_, index) => ({ id: index, x: (Math.random() - .5) * 700, y: (Math.random() - .5) * 500, symbol: ['💖', '🌸', '✨', '♡'][index % 4] })))
    setShowBurst(true)
    setTimeout(() => { setGiftOpened(true); setShowBurst(false); if (musicEnabled) audioRef.current?.play().catch(() => undefined) }, 1000)
  }
  const addPhotoFiles = (fileList: FileList | null) => {
    if (!fileList) return
    Array.from(fileList).forEach((file) => { if (!file.type.startsWith('image/')) return; const reader = new FileReader(); reader.onload = () => { if (typeof reader.result === 'string') setPhotos((prev) => [{ id: `${Date.now()}-${Math.random()}`, src: reader.result as string, caption: 'Новый тёплый момент' }, ...prev]) }; reader.readAsDataURL(file) })
  }
  const handleTimelineSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!newTimeline.date || !newTimeline.title || !newTimeline.description) return
    setTimeline((prev) => [...prev, { id: `${Date.now()}`, ...newTimeline, image: newTimeline.image || 'https://picsum.photos/seed/new-moment/220/220' }])
    setNewTimeline({ date: '', title: '', description: '', image: '' })
  }
  const handleAddReason = () => { const value = newReason.trim(); if (!value) return; setReasons((prev) => [value, ...prev]); setNewReason(''); setReasonModalOpen(false) }
  const handleWishSubmit = () => {
    const text = wishInput.trim(); if (!text) return
    setWishes((prev) => [{ id: `${Date.now()}`, text, completed: false }, ...prev]); setWishInput(''); setWishEditorOpen(false); setWishStatus('Желание сохранено ✨'); setShootingStar(true)
    setTimeout(() => setShootingStar(false), 1500); setTimeout(() => setWishStatus(''), 2600)
  }
  const toggleWish = (id: string) => setWishes((prev) => prev.map((wish) => wish.id === id ? { ...wish, completed: !wish.completed } : wish))

  return <>
    <audio ref={audioRef} loop src="https://cdn.pixabay.com/download/audio/2022/03/10/audio_4721725622.mp3" />
    <div className="petals-layer" aria-hidden="true">{petals.map((petal) => <span key={petal.id} className="petal" style={{ left: petal.left, animationDuration: `${petal.duration}s`, animationDelay: `${petal.delay}s`, width: `${petal.size}px`, height: `${petal.size + 8}px` }} />)}</div>

    <AnimatePresence>{!giftOpened && <motion.section className="start-screen" style={{ '--mouse-x': `${mouseGlow.x}%`, '--mouse-y': `${mouseGlow.y}%` } as React.CSSProperties} initial={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.06, filter: 'blur(12px)' }} transition={{ duration: 1 }}>
      <div className="start-depth" aria-hidden="true"><span className="orb orb-one" /><span className="orb orb-two" /><span className="orb orb-three" /><span className="halo" /><div className="grid-floor" /></div>
      <div className="start-copy">
        <motion.div className="intro-kicker" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .25 }}>для самого дорогого человека <Heart size={13} fill="currentColor" /></motion.div>
        <div className="intro-title" aria-label={heroText}>{heroChars.map((char, index) => <motion.span key={`${char}-${index}`} className={char === ' ' ? 'title-space' : undefined} initial={{ opacity: 0, y: 35, rotateX: -80 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ delay: .35 + index * .045, duration: .7, ease: 'easeOut' }}>{char === ' ' ? '\u00A0' : char}</motion.span>)}</div>
        <motion.p className="intro-message" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.35, duration: .8 }}>Я приготовил для тебя маленькую вселенную.<br /><strong>Нажми на подарок — и начнём нашу историю.</strong></motion.p>
      </div>
      <motion.div className="gift-stage" initial={{ opacity: 0, scale: .7 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: .55, duration: 1, type: 'spring' }}>
        <div className="gift-aura" /><div className="gift-orbit orbit-a" /><div className="gift-orbit orbit-b" />
        <motion.button type="button" className="gift-visual" whileHover={{ scale: 1.06, rotateY: -5, rotateX: 4 }} whileTap={{ scale: .94 }} animate={{ y: [0, -10, 0] }} transition={{ y: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' } }} onClick={handleOpenGift} aria-label="Открыть подарок">
          <span className="gift-lid"><i /><b /></span><span className="gift-box"><i /><b /></span><span className="gift-ribbon" />
        </motion.button>
        <motion.div className="gift-hint" animate={{ opacity: [0.55, 1, .55] }} transition={{ duration: 2.2, repeat: Infinity }}>нажми, чтобы открыть</motion.div>
      </motion.div>
      <button type="button" className="music-toggle start-music" onClick={() => setMusicEnabled((prev) => !prev)} aria-label="Переключить музыку">{musicEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}</button>
      <AnimatePresence>{showBurst && <motion.div className="burst" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>{burstItems.map((item) => <motion.span key={item.id} className="burst-item" initial={{ x: 0, y: 0, opacity: 1, scale: .5 }} animate={{ x: item.x, y: item.y, opacity: 0, scale: 1.5, rotate: Math.random() * 180 }} transition={{ duration: 1, ease: 'easeOut' }}>{item.symbol}</motion.span>)}</motion.div>}</AnimatePresence>
    </motion.section>}</AnimatePresence>

    <AnimatePresence>{giftOpened && <motion.main className="page" style={{ '--mouse-x': `${mouseGlow.x}%`, '--mouse-y': `${mouseGlow.y}%` } as React.CSSProperties} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .9 }}>
      <div className="cursor-light" aria-hidden="true" />
      <section className="hero section" id="hero"><button type="button" className="music-toggle main" onClick={() => setMusicEnabled((prev) => !prev)} aria-label="Переключить музыку">{musicEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}</button><div className="floating-hearts" style={{ transform: `translateY(${scrollY * .08}px)` }}><Heart /><Heart /><Sparkles /></div>
        <motion.p className="hero-eyebrow" initial={{ opacity: 0, letterSpacing: '.6em' }} animate={{ opacity: 1, letterSpacing: '.22em' }}>сегодня весь мир немного красивее</motion.p>
        <h1>{heroChars.map((char, index) => <motion.span key={`${char}-${index}`} className={char === ' ' ? 'title-space' : undefined} initial={{ opacity: 0, y: 22, rotateX: -60 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ delay: index * .035 }}>{char === ' ' ? '\u00A0' : char}</motion.span>)}</h1>
        <p className="subtitle">Потому что сегодня родилась ты — и однажды наши дороги встретились.</p>
        <div className="counter-card"><CalendarHeart size={20} /><p>Мы вместе уже: <strong>{togetherTime.days}</strong> дней, <strong>{togetherTime.hours}</strong> часов, <strong>{togetherTime.minutes}</strong> минут</p></div>
      </section>

      <motion.section className="section love-letter" initial={{ opacity: 0, y: 60, rotateX: -18 }} whileInView={{ opacity: 1, y: 0, rotateX: 0 }} viewport={{ once: true, amount: .3 }} transition={{ duration: .9 }}><h2>Моё любовное письмо</h2><p>[Здесь будет твой длинный, тёплый и искренний текст-послание. Замени этот placeholder на свою историю, воспоминания и самые важные слова для любимой.]</p></motion.section>

      <motion.section className="section section-zone zone-gallery" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }} transition={{ duration: .7 }}><div className="section-head"><h2>Галерея воспоминаний</h2><button type="button" className="add-button" onClick={() => fileInputRef.current?.click()}><Plus size={16} /> Добавить фото</button><input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={(event) => addPhotoFiles(event.target.files)} /></div><div className="drop-zone" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); addPhotoFiles(event.dataTransfer.files) }}>Перетащи фото сюда или нажми «Добавить фото»</div><div className="gallery-grid">{photos.map((photo, index) => <motion.button type="button" key={photo.id} className="photo-card" onClick={() => setSelectedPhoto(photo)} whileHover={{ rotate: 0, scale: 1.04 }} style={{ rotate: `${(index % 2 === 0 ? -1 : 1) * ((index % 4) + 1)}deg` }}><img src={photo.src} alt={photo.caption} /><span>{photo.caption}</span></motion.button>)}</div></motion.section>

      <motion.section className="section section-zone zone-timeline timeline-section" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .15 }} transition={{ duration: .75 }}><h2>Наша история</h2><div className="timeline">{timeline.map((item, index) => <motion.article key={item.id} className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .3 }}><img src={sanitizeImageUrl(item.image) || 'https://picsum.photos/seed/new-moment/220/220'} alt={item.title} /><div><time>{item.date}</time><h3>{item.title}</h3><p>{item.description}</p></div></motion.article>)}</div><form className="timeline-form" onSubmit={handleTimelineSubmit}><h3>Добавить событие</h3><input placeholder="Дата" value={newTimeline.date} onChange={(event) => setNewTimeline((prev) => ({ ...prev, date: event.target.value }))} /><input placeholder="Заголовок" value={newTimeline.title} onChange={(event) => setNewTimeline((prev) => ({ ...prev, title: event.target.value }))} /><textarea placeholder="Описание" value={newTimeline.description} onChange={(event) => setNewTimeline((prev) => ({ ...prev, description: event.target.value }))} /><input placeholder="Ссылка на мини-фото (опционально)" value={newTimeline.image} onChange={(event) => setNewTimeline((prev) => ({ ...prev, image: event.target.value }))} /><button type="submit" className="add-button">Добавить</button></form></motion.section>

      <motion.section className="section section-zone zone-reasons" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }} transition={{ duration: .7 }}><div className="section-head"><h2>Почему я тебя люблю</h2><button type="button" className="add-button" onClick={() => setReasonModalOpen(true)}>Добавить причину</button></div><div className="reasons-grid">{reasons.map((reason, index) => <motion.div className="reason-card" key={`${reason}-${index}`} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }} transition={{ delay: index * .05 }}><span>💗</span><p>{reason}</p></motion.div>)}</div></motion.section>

      <motion.section className="section section-zone zone-wishes wishes" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .3 }} transition={{ duration: .7 }}><div className="love-board" aria-live="polite"><p>На всех языках мира:</p><AnimatePresence mode="wait"><motion.strong key={rotatingLoveText} initial={{ opacity: 0, y: 8, filter: 'blur(5px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0)' }} exit={{ opacity: 0, y: -8, filter: 'blur(5px)' }}>{rotatingLoveText}</motion.strong></AnimatePresence></div><h2>Твои желания ✨</h2><p>Пусть маленькие мечты превращаются в большие счастливые моменты. Записывай их сюда и отмечай те, что уже исполнились.</p><button type="button" className="add-button" onClick={() => setWishEditorOpen((prev) => !prev)}><Star size={16} /> Добавить желание</button><AnimatePresence>{wishEditorOpen && <motion.div className="wish-editor" initial={{ opacity: 0, y: 8, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: .98 }}><textarea value={wishInput} onChange={(event) => setWishInput(event.target.value)} placeholder="Напиши своё желание..." /><button type="button" className="add-button" onClick={handleWishSubmit}>Сохранить желание</button></motion.div>}</AnimatePresence>{wishStatus && <p className="wish-status">{wishStatus}</p>}<div className="wish-progress"><span><strong>{completedWishes}</strong> из <strong>{wishes.length}</strong> исполнено</span><div><i style={{ width: wishes.length ? `${completedWishes / wishes.length * 100}%` : '0%' }} /></div></div><div className="wish-list">{wishes.length === 0 ? <div className="wish-empty"><Sparkles size={24} /><span>Здесь пока пусто. Загадай первое желание.</span></div> : wishes.map((wish, index) => <motion.button type="button" className={`wish-item ${wish.completed ? 'completed' : ''}`} key={wish.id} onClick={() => toggleWish(wish.id)} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .04 }}><span className="wish-check">{wish.completed && <Check size={15} />}</span><span className="wish-text">{wish.text}</span><span className="wish-state">{wish.completed ? 'исполнено' : 'отметить'}</span></motion.button>)}</div>{shootingStar && <span className="shooting-star" aria-hidden="true" />}</motion.section>
      <footer className="section footer"><Heart size={16} /><p>С любовью, {YOUR_NAME} ❤️ • {new Date().getFullYear()}</p></footer>
    </motion.main>}</AnimatePresence>

    <AnimatePresence>{reasonModalOpen && <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><motion.div className="modal" initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .9 }}><button className="icon-button" type="button" onClick={() => setReasonModalOpen(false)}><X size={16} /></button><h3>Добавить причину</h3><textarea value={newReason} onChange={(event) => setNewReason(event.target.value)} placeholder="Напиши причину..." /><button type="button" className="add-button" onClick={handleAddReason}>Сохранить</button></motion.div></motion.div>}</AnimatePresence>
    <AnimatePresence>{selectedPhoto && <motion.button className="lightbox" type="button" onClick={() => setSelectedPhoto(null)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><img src={selectedPhoto.src} alt={selectedPhoto.caption} /></motion.button>}</AnimatePresence>
  </>
}
export default App
