import React, { useState } from 'react';
import { useSiteData } from '@/contexts/SiteDataContext';
import { HouseModel } from '@/data/siteData';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';

export default function Catalog() {
  const { siteData } = useSiteData();
  const [selectedModel, setSelectedModel] = useState<HouseModel | null>(null);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(price);
  };

  return (
    <div className="container mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="font-serif text-4xl md:text-5xl text-primary mb-4">House Models</h1>
        <p className="text-muted-foreground font-light mb-12 max-w-2xl">
          Explore our portfolio of premium residences, designed with meticulous attention to detail and uncompromising quality.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {siteData.houseModels.map((model, index) => (
            <motion.div
              key={model.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group cursor-pointer"
              onClick={() => setSelectedModel(model)}
            >
              <div className="relative aspect-[4/3] overflow-hidden mb-6 bg-card border border-white/5">
                {model.gallery[0] && (
                  <img 
                    src={model.gallery[0].url} 
                    alt={model.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>
              </div>
              <div className="flex justify-between items-end mb-2">
                <h3 className="font-serif text-2xl">{model.name}</h3>
                <span className="text-primary">{formatPrice(model.price, model.currency)}</span>
              </div>
              <div className="flex gap-4 text-sm text-muted-foreground font-light uppercase tracking-wider mb-3">
                <span>{model.area} {siteData.config.measurementUnit}</span>
                <span>{model.bedrooms} Beds</span>
                <span>{model.bathrooms} Baths</span>
              </div>
              <p className="text-sm text-muted-foreground/80 line-clamp-2">
                {model.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <Dialog open={!!selectedModel} onOpenChange={() => setSelectedModel(null)}>
        <DialogContent className="max-w-5xl h-[80vh] bg-background border-primary/20 flex flex-col p-0 overflow-hidden">
          {selectedModel && (
            <>
              <div className="p-6 border-b border-white/5 shrink-0">
                <DialogHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <DialogTitle className="font-serif text-3xl text-primary">{selectedModel.name}</DialogTitle>
                      <div className="flex gap-4 text-sm text-muted-foreground font-light uppercase tracking-wider mt-2">
                        <span>{selectedModel.area} {siteData.config.measurementUnit}</span>
                        <span>{selectedModel.bedrooms} Beds</span>
                        <span>{selectedModel.bathrooms} Baths</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl">{formatPrice(selectedModel.price, selectedModel.currency)}</div>
                    </div>
                  </div>
                </DialogHeader>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                <p className="text-muted-foreground font-light mb-8 max-w-3xl">
                  {selectedModel.description}
                </p>
                
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="bg-transparent border-b border-white/10 rounded-none w-full justify-start h-auto p-0 mb-6">
                    <TabsTrigger value="all" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2 uppercase tracking-widest text-xs">All</TabsTrigger>
                    <TabsTrigger value="interior" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2 uppercase tracking-widest text-xs">Interior</TabsTrigger>
                    <TabsTrigger value="exterior" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2 uppercase tracking-widest text-xs">Exterior</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="mt-0">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedModel.gallery.map((img, i) => (
                        <div key={i} className="relative aspect-square group overflow-hidden border border-white/5">
                          <img src={img.url} alt={img.caption || "Gallery image"} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4 text-center">
                            <span className="font-serif text-sm text-white">{img.caption || img.room.replace('_', ' ')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="interior" className="mt-0">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedModel.gallery.filter(img => img.category === 'interior').map((img, i) => (
                        <div key={i} className="relative aspect-square group overflow-hidden border border-white/5">
                          <img src={img.url} alt={img.caption || "Gallery image"} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4 text-center">
                            <span className="font-serif text-sm text-white">{img.caption || img.room.replace('_', ' ')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="exterior" className="mt-0">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedModel.gallery.filter(img => img.category === 'exterior').map((img, i) => (
                        <div key={i} className="relative aspect-square group overflow-hidden border border-white/5">
                          <img src={img.url} alt={img.caption || "Gallery image"} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4 text-center">
                            <span className="font-serif text-sm text-white">{img.caption || img.room.replace('_', ' ')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
