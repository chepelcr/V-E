import React, { useState, useMemo } from 'react';
import { useSiteData } from '@/contexts/SiteDataContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { HouseModel, GalleryImage } from '@/data/siteData';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';

type SpaceFilter = 'all' | 'interior' | 'exterior';
type RoomType = GalleryImage['room'];

const ROOM_ORDER: RoomType[] = ['facade', 'gate', 'garden', 'patio', 'living_room', 'kitchen', 'bedroom', 'bathroom'];

export default function Catalog() {
  const { siteData } = useSiteData();
  const { t } = useLanguage();
  const [selectedModel, setSelectedModel] = useState<HouseModel | null>(null);
  const [spaceFilter, setSpaceFilter] = useState<SpaceFilter>('all');
  const [roomFilter, setRoomFilter] = useState<RoomType | 'all'>('all');

  const formatPrice = (price: number, currency: string) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(price);

  const handleModelOpen = (model: HouseModel) => {
    setSelectedModel(model);
    setSpaceFilter('all');
    setRoomFilter('all');
  };

  const handleSpaceChange = (space: SpaceFilter) => {
    setSpaceFilter(space);
    setRoomFilter('all');
  };

  const filteredGallery = useMemo(() => {
    if (!selectedModel) return [];
    let imgs = selectedModel.gallery;
    if (spaceFilter !== 'all') imgs = imgs.filter(img => img.category === spaceFilter);
    if (roomFilter !== 'all') imgs = imgs.filter(img => img.room === roomFilter);
    return imgs;
  }, [selectedModel, spaceFilter, roomFilter]);

  const availableRooms = useMemo((): RoomType[] => {
    if (!selectedModel) return [];
    const subset = spaceFilter === 'all'
      ? selectedModel.gallery
      : selectedModel.gallery.filter(img => img.category === spaceFilter);
    const roomSet = new Set(subset.map(img => img.room));
    return ROOM_ORDER.filter(r => roomSet.has(r));
  }, [selectedModel, spaceFilter]);

  const spaceButtons: { value: SpaceFilter; label: string }[] = [
    { value: 'all', label: t.catalog.all },
    { value: 'interior', label: t.catalog.interior },
    { value: 'exterior', label: t.catalog.exterior },
  ];

  return (
    <div className="container mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="font-serif text-4xl md:text-5xl text-primary mb-4">{t.catalog.title}</h1>
        <p className="text-muted-foreground font-light mb-12 max-w-2xl">
          {t.catalog.subtitle}
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {siteData.houseModels.map((model, index) => (
            <motion.div
              key={model.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group cursor-pointer"
              onClick={() => handleModelOpen(model)}
              data-testid={`card-model-${model.id}`}
            >
              <div className="relative aspect-[4/3] overflow-hidden mb-6 bg-card border border-border/30">
                {model.gallery[0] && (
                  <img
                    src={model.gallery[0].url}
                    alt={model.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <div className="flex justify-between items-end mb-2">
                <h3 className="font-serif text-2xl">{model.name}</h3>
                <span className="text-primary font-light">{formatPrice(model.price, model.currency)}</span>
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground font-light uppercase tracking-wider mb-3">
                <span>{model.area} {siteData.config.measurementUnit}</span>
                <span>{model.bedrooms} {t.catalog.beds}</span>
                <span>{model.bathrooms} {t.catalog.baths}</span>
              </div>
              <p className="text-sm text-muted-foreground/80 line-clamp-2">{model.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <Dialog open={!!selectedModel} onOpenChange={() => setSelectedModel(null)}>
        <DialogContent className="max-w-5xl h-[85vh] bg-background border-border/40 flex flex-col p-0 overflow-hidden">
          {selectedModel && (
            <>
              {/* Header */}
              <div className="p-6 border-b border-border/30 shrink-0">
                <DialogHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <DialogTitle className="font-serif text-3xl text-primary">{selectedModel.name}</DialogTitle>
                      <div className="flex gap-4 text-xs text-muted-foreground font-light uppercase tracking-wider mt-2">
                        <span>{selectedModel.area} {siteData.config.measurementUnit}</span>
                        <span>{selectedModel.bedrooms} {t.catalog.beds}</span>
                        <span>{selectedModel.bathrooms} {t.catalog.baths}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl text-primary font-light">{formatPrice(selectedModel.price, selectedModel.currency)}</div>
                    </div>
                  </div>
                </DialogHeader>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="p-6 pb-3">
                  <p className="text-muted-foreground font-light mb-6 max-w-3xl">{selectedModel.description}</p>

                  {/* Level 1 — Space filter: All / Interior / Exterior */}
                  <div className="flex gap-2 mb-4" data-testid="filter-space">
                    {spaceButtons.map(btn => (
                      <button
                        key={btn.value}
                        onClick={() => handleSpaceChange(btn.value)}
                        data-testid={`button-space-${btn.value}`}
                        className={`px-4 py-1.5 text-xs tracking-widest uppercase border transition-colors ${
                          spaceFilter === btn.value
                            ? 'border-primary text-primary bg-primary/10'
                            : 'border-border/40 text-muted-foreground hover:border-primary/50 hover:text-primary'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>

                  {/* Level 2 — Room type filter (shown when rooms exist) */}
                  <AnimatePresence>
                    {availableRooms.length > 1 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-wrap gap-2 mb-6 overflow-hidden"
                        data-testid="filter-room"
                      >
                        <button
                          onClick={() => setRoomFilter('all')}
                          data-testid="button-room-all"
                          className={`px-3 py-1 text-xs tracking-wider uppercase border transition-colors ${
                            roomFilter === 'all'
                              ? 'border-primary/60 text-primary bg-primary/8'
                              : 'border-border/30 text-muted-foreground/70 hover:border-primary/40 hover:text-primary/80'
                          }`}
                        >
                          {t.catalog.all}
                        </button>
                        {availableRooms.map(room => (
                          <button
                            key={room}
                            onClick={() => setRoomFilter(room)}
                            data-testid={`button-room-${room}`}
                            className={`px-3 py-1 text-xs tracking-wider uppercase border transition-colors ${
                              roomFilter === room
                                ? 'border-primary/60 text-primary bg-primary/8'
                                : 'border-border/30 text-muted-foreground/70 hover:border-primary/40 hover:text-primary/80'
                            }`}
                          >
                            {t.catalog.rooms[room]}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Gallery grid */}
                <div className="px-6 pb-6">
                  {filteredGallery.length === 0 ? (
                    <div className="flex items-center justify-center h-40 text-muted-foreground font-light text-sm tracking-wider">
                      {t.catalog.noImages}
                    </div>
                  ) : (
                    <motion.div
                      key={`${spaceFilter}-${roomFilter}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="grid grid-cols-2 md:grid-cols-3 gap-3"
                    >
                      {filteredGallery.map((img, i) => (
                        <div key={i} className="relative aspect-square group overflow-hidden border border-border/30" data-testid={`img-gallery-${i}`}>
                          <img
                            src={img.url}
                            alt={img.caption || img.room}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          {/* Room label badge */}
                          <div className="absolute top-2 left-2">
                            <span className="text-[10px] tracking-widest uppercase bg-black/70 text-white/80 px-2 py-0.5 font-light">
                              {t.catalog.rooms[img.room]}
                            </span>
                          </div>
                          {/* Space badge */}
                          <div className="absolute top-2 right-2">
                            <span className={`text-[10px] tracking-widest uppercase px-2 py-0.5 font-light ${
                              img.category === 'interior'
                                ? 'bg-amber-900/70 text-amber-200'
                                : 'bg-emerald-900/70 text-emerald-200'
                            }`}>
                              {img.category === 'interior' ? t.catalog.interior : t.catalog.exterior}
                            </span>
                          </div>
                          {/* Caption overlay */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                            <span className="font-serif text-sm text-white/90">
                              {img.caption || t.catalog.rooms[img.room]}
                            </span>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
