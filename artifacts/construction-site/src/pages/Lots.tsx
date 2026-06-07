import React, { useState, useMemo } from 'react';
import { useSiteData } from '@/contexts/SiteDataContext';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

export default function Lots() {
  const { siteData } = useSiteData();
  const [province, setProvince] = useState<string>("all");
  const [canton, setCanton] = useState<string>("all");
  const [district, setDistrict] = useState<string>("all");
  const [minSize, setMinSize] = useState<string>("");

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(price);
  };

  const provinces = useMemo(() => {
    const provs = new Set(siteData.lots.map(l => l.location.province));
    return Array.from(provs);
  }, [siteData.lots]);

  const cantons = useMemo(() => {
    if (province === "all") return [];
    const cants = new Set(siteData.lots.filter(l => l.location.province === province).map(l => l.location.canton));
    return Array.from(cants);
  }, [siteData.lots, province]);

  const districts = useMemo(() => {
    if (canton === "all") return [];
    const dists = new Set(siteData.lots.filter(l => l.location.canton === canton).map(l => l.location.district));
    return Array.from(dists);
  }, [siteData.lots, canton]);

  const filteredLots = useMemo(() => {
    return siteData.lots.filter(lot => {
      if (province !== "all" && lot.location.province !== province) return false;
      if (canton !== "all" && lot.location.canton !== canton) return false;
      if (district !== "all" && lot.location.district !== district) return false;
      if (minSize && lot.size < Number(minSize)) return false;
      return true;
    });
  }, [siteData.lots, province, canton, district, minSize]);

  return (
    <div className="container mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="font-serif text-4xl md:text-5xl text-primary mb-4">Prime Lots</h1>
        <p className="text-muted-foreground font-light mb-12 max-w-2xl">
          Discover exclusive locations for your future home. Filter by region and size to find the perfect canvas.
        </p>

        <div className="grid md:grid-cols-4 gap-4 mb-12 p-6 bg-card border border-white/5">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Province</label>
            <Select value={province} onValueChange={(v) => { setProvince(v); setCanton("all"); setDistrict("all"); }}>
              <SelectTrigger className="bg-transparent border-white/10 focus:border-primary">
                <SelectValue placeholder="All Provinces" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Provinces</SelectItem>
                {provinces.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Canton</label>
            <Select value={canton} onValueChange={(v) => { setCanton(v); setDistrict("all"); }} disabled={province === "all"}>
              <SelectTrigger className="bg-transparent border-white/10 focus:border-primary">
                <SelectValue placeholder="All Cantons" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cantons</SelectItem>
                {cantons.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">District</label>
            <Select value={district} onValueChange={setDistrict} disabled={canton === "all"}>
              <SelectTrigger className="bg-transparent border-white/10 focus:border-primary">
                <SelectValue placeholder="All Districts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Districts</SelectItem>
                {districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Min Size ({siteData.config.measurementUnit})</label>
            <Input 
              type="number" 
              placeholder={`e.g. 500`}
              value={minSize}
              onChange={(e) => setMinSize(e.target.value)}
              className="bg-transparent border-white/10 focus-visible:border-primary focus-visible:ring-0"
            />
          </div>
        </div>

        <div className="space-y-6">
          {filteredLots.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              No lots found matching your criteria.
            </div>
          ) : (
            filteredLots.map((lot, index) => (
              <motion.div 
                key={lot.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col md:flex-row justify-between p-6 bg-card border border-white/5 hover:border-primary/50 transition-colors"
              >
                <div className="mb-4 md:mb-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-serif text-2xl text-foreground">{lot.name}</h3>
                    {!lot.available && <span className="text-xs border border-destructive text-destructive px-2 py-1 uppercase tracking-widest">Sold</span>}
                  </div>
                  <p className="text-muted-foreground text-sm mb-4">
                    {lot.location.district}, {lot.location.canton}, {lot.location.province}
                  </p>
                  <p className="font-light text-sm max-w-2xl">{lot.description}</p>
                </div>
                <div className="text-left md:text-right flex flex-col justify-between">
                  <div className="text-2xl text-primary mb-2">
                    {formatPrice(lot.price, lot.currency)}
                  </div>
                  <div className="text-sm font-light text-muted-foreground uppercase tracking-widest">
                    {lot.size} {siteData.config.measurementUnit}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
