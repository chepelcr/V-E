import React, { useState } from 'react';
import { useSiteData } from '@/contexts/SiteDataContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const { siteData, updateSiteData, exportJSON } = useSiteData();

  // Local state for editing the config/corporate text
  const [localConfig, setLocalConfig] = useState(siteData.config);
  const [localCorporate, setLocalCorporate] = useState(siteData.corporate);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '1234') {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect PIN');
    }
  };

  const handleSaveConfig = () => {
    updateSiteData({
      ...siteData,
      config: localConfig,
      corporate: localCorporate
    });
    alert('Config saved');
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-6 py-24 flex justify-center">
        <div className="bg-card border border-white/5 p-8 max-w-sm w-full text-center">
          <h2 className="font-serif text-2xl mb-6 text-primary">Admin Access</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input 
              type="password" 
              placeholder="Enter PIN" 
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="bg-transparent border-white/10 rounded-none text-center"
            />
            <Button type="submit" className="w-full rounded-none">Enter</Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-3xl text-primary">Data Dashboard</h1>
        <Button onClick={exportJSON} variant="outline" className="border-primary text-primary rounded-none">
          Export JSON
        </Button>
      </div>

      <Tabs defaultValue="config" className="w-full">
        <TabsList className="bg-transparent border-b border-white/10 rounded-none w-full justify-start h-auto p-0 mb-8 overflow-x-auto flex-nowrap">
          <TabsTrigger value="config" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2">Global Config</TabsTrigger>
          <TabsTrigger value="models" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2">House Models</TabsTrigger>
          <TabsTrigger value="lots" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2">Lots</TabsTrigger>
          <TabsTrigger value="providers" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2">Providers</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-8 max-w-2xl">
          <div className="space-y-4 p-6 bg-card border border-white/5">
            <h3 className="font-serif text-xl">Site Details</h3>
            <div>
              <label className="text-xs uppercase text-muted-foreground">Company Name</label>
              <Input value={localConfig.companyName} onChange={e => setLocalConfig({...localConfig, companyName: e.target.value})} className="bg-transparent border-white/10 rounded-none mt-1" />
            </div>
            <div>
              <label className="text-xs uppercase text-muted-foreground">Tagline</label>
              <Input value={localConfig.tagline} onChange={e => setLocalConfig({...localConfig, tagline: e.target.value})} className="bg-transparent border-white/10 rounded-none mt-1" />
            </div>
          </div>

          <div className="space-y-4 p-6 bg-card border border-white/5">
            <h3 className="font-serif text-xl">Corporate Section</h3>
            <div>
              <label className="text-xs uppercase text-muted-foreground">Mission</label>
              <Textarea value={localCorporate.mission} onChange={e => setLocalCorporate({...localCorporate, mission: e.target.value})} className="bg-transparent border-white/10 rounded-none mt-1 min-h-[100px]" />
            </div>
            <div>
              <label className="text-xs uppercase text-muted-foreground">Vision</label>
              <Textarea value={localCorporate.vision} onChange={e => setLocalCorporate({...localCorporate, vision: e.target.value})} className="bg-transparent border-white/10 rounded-none mt-1 min-h-[100px]" />
            </div>
            <div>
              <label className="text-xs uppercase text-muted-foreground">About</label>
              <Textarea value={localCorporate.about} onChange={e => setLocalCorporate({...localCorporate, about: e.target.value})} className="bg-transparent border-white/10 rounded-none mt-1 min-h-[150px]" />
            </div>
          </div>

          <Button onClick={handleSaveConfig} className="rounded-none">Save Changes</Button>
        </TabsContent>

        <TabsContent value="models">
          <div className="text-muted-foreground p-6 border border-white/5">
            House Models editing is simplified in this view. Use Export JSON to edit raw data.
            <div className="mt-4 space-y-4">
              {siteData.houseModels.map(m => (
                <div key={m.id} className="p-4 bg-card border border-white/5 flex justify-between">
                  <span>{m.name}</span>
                  <span className="text-primary">${m.price}</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="lots">
          <div className="text-muted-foreground p-6 border border-white/5">
            Lots editing is simplified in this view. Use Export JSON to edit raw data.
            <div className="mt-4 space-y-4">
              {siteData.lots.map(l => (
                <div key={l.id} className="p-4 bg-card border border-white/5 flex justify-between">
                  <span>{l.name} - {l.location.district}</span>
                  <span className="text-primary">${l.price}</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="providers">
          <div className="text-muted-foreground p-6 border border-white/5">
            Providers editing is simplified in this view. Use Export JSON to edit raw data.
            <div className="mt-4 space-y-4">
              {siteData.providers.map(p => (
                <div key={p.id} className="p-4 bg-card border border-white/5 flex justify-between">
                  <span>{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
