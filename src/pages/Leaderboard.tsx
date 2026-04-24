import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AppLayout } from "@/components/AppLayout";
import { Trophy, Medal, Star, TrendingUp, Crown, ArrowUp, ArrowDown, Minus } from "lucide-react";

const leaderboardData = {
  global: [
    { rank: 1, team: "Nova Squad", score: 9950, change: "up", members: 5, streak: 12 },
    { rank: 2, team: "Matrix Guild", score: 9480, change: "same", members: 4, streak: 8 },
    { rank: 3, team: "Promptsmiths", score: 9020, change: "up", members: 6, streak: 15 },
    { rank: 4, team: "Code Collective", score: 8740, change: "down", members: 3, streak: 5 },
    { rank: 5, team: "Data Dynamos", score: 8310, change: "up", members: 5, streak: 9 },
    { rank: 6, team: "Algo Aces", score: 7890, change: "down", members: 4, streak: 3 },
    { rank: 7, team: "Codez", score: 7950, change: "up", members: 4, streak: 7 },
    { rank: 8, team: "You", score: 7480, change: "up", members: 1, streak: 6, isCurrentUser: true },
    { rank: 9, team: "Innovators", score: 7020, change: "down", members: 3, streak: 2 },
    { rank: 10, team: "Neural Nomads", score: 6890, change: "same", members: 5, streak: 4 },
  ],
  seasonal: [
    { rank: 1, team: "Summer Sprinters", score: 4500, change: "up", members: 5, streak: 7 },
    { rank: 2, team: "Winter Wizards", score: 4320, change: "down", members: 4, streak: 5 },
    { rank: 3, team: "Autumn Architects", score: 4100, change: "up", members: 6, streak: 9 },
    { rank: 4, team: "Spring Scholars", score: 3850, change: "same", members: 3, streak: 4 },
    { rank: 5, team: "You", score: 3200, change: "up", members: 1, streak: 6, isCurrentUser: true },
  ],
};

const rankColors: Record<number, string> = {
  1: "text-yellow-500",
  2: "text-slate-400",
  3: "text-orange-500",
};

const rankIcons: Record<number, React.ReactNode> = {
  1: <Crown className="w-4 h-4 text-yellow-500" />,
  2: <Medal className="w-4 h-4 text-slate-400" />,
  3: <Medal className="w-4 h-4 text-orange-500" />,
};

const ChangeIndicator = ({ change }: { change: string }) => {
  if (change === "up") return <ArrowUp className="w-3.5 h-3.5 text-green-500" />;
  if (change === "down") return <ArrowDown className="w-3.5 h-3.5 text-red-500" />;
  return <Minus className="w-3.5 h-3.5 text-muted-foreground" />;
};

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState("global");
  const data = leaderboardData[activeTab as keyof typeof leaderboardData];
  const currentUser = data.find((d: any) => d.isCurrentUser);

  return (
    <AppLayout title="Leaderboard">
      <div className="p-8 space-y-8">
        {/* Top 3 podium */}
        <section>
          <div className="flex items-end justify-center gap-4 mb-8">
            {/* 2nd place */}
            <div className="flex flex-col items-center">
              <Avatar className="w-14 h-14 mb-2 ring-2 ring-slate-400/50">
                <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-sm font-bold">
                  {data[1]?.team.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="w-20 h-16 bg-slate-400/20 rounded-t-xl flex flex-col items-center justify-center">
                <Medal className="w-4 h-4 text-slate-400 mb-1" />
                <p className="text-lg font-black">2</p>
              </div>
              <p className="text-xs font-medium mt-2 text-center max-w-[80px] truncate">{data[1]?.team}</p>
              <p className="text-xs text-muted-foreground">{data[1]?.score.toLocaleString()}</p>
            </div>
            {/* 1st place */}
            <div className="flex flex-col items-center -mt-4">
              <Crown className="w-6 h-6 text-yellow-500 mb-1" />
              <Avatar className="w-16 h-16 mb-2 ring-4 ring-yellow-400/50">
                <AvatarFallback className="bg-yellow-100 dark:bg-yellow-900/30 text-sm font-bold text-yellow-700 dark:text-yellow-400">
                  {data[0]?.team.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="w-24 h-24 bg-yellow-400/20 rounded-t-xl flex flex-col items-center justify-center">
                <Trophy className="w-5 h-5 text-yellow-500 mb-1" />
                <p className="text-2xl font-black">1</p>
              </div>
              <p className="text-xs font-semibold mt-2 text-center max-w-[90px] truncate">{data[0]?.team}</p>
              <p className="text-xs text-muted-foreground">{data[0]?.score.toLocaleString()}</p>
            </div>
            {/* 3rd place */}
            <div className="flex flex-col items-center">
              <Avatar className="w-14 h-14 mb-2 ring-2 ring-orange-400/50">
                <AvatarFallback className="bg-orange-100 dark:bg-orange-900/30 text-sm font-bold">
                  {data[2]?.team.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="w-20 h-12 bg-orange-400/20 rounded-t-xl flex flex-col items-center justify-center">
                <Medal className="w-4 h-4 text-orange-500 mb-1" />
                <p className="text-lg font-black">3</p>
              </div>
              <p className="text-xs font-medium mt-2 text-center max-w-[80px] truncate">{data[2]?.team}</p>
              <p className="text-xs text-muted-foreground">{data[2]?.score.toLocaleString()}</p>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <div className="flex gap-2">
          {["global", "seasonal"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all capitalize ${
                activeTab === tab ? "bg-primary text-white shadow-lg shadow-primary/25" : "glass text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main table */}
          <Card className="glass xl:col-span-2">
            <CardContent className="pt-4">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/40">
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead className="text-center w-16">Change</TableHead>
                    <TableHead className="text-center w-20">Streak</TableHead>
                    <TableHead className="text-right w-24">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((entry: any) => (
                    <TableRow
                      key={entry.rank}
                      className={`border-border/30 ${entry.isCurrentUser ? "bg-primary/5 font-semibold" : ""}`}
                    >
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {rankIcons[entry.rank] ?? (
                            <span className={`text-sm font-bold ${rankColors[entry.rank] || "text-muted-foreground"}`}>
                              {entry.rank}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar className="w-7 h-7">
                            <AvatarFallback className={`text-xs ${entry.isCurrentUser ? "bg-primary/20 text-primary" : "bg-muted"}`}>
                              {entry.team.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">
                            {entry.team}
                            {entry.isCurrentUser && <Badge className="ml-2 text-xs bg-primary/15 text-primary border-primary/30">You</Badge>}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <ChangeIndicator change={entry.change} />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1 text-xs">
                          <Star className="w-3 h-3 text-yellow-500" />
                          {entry.streak}d
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-bold text-sm ${rankColors[entry.rank] || ""}`}>
                          {entry.score.toLocaleString()}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Side cards */}
          <div className="space-y-4">
            {currentUser && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" /> Your Position
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <p className="text-4xl font-black">#{currentUser.rank}</p>
                    <p className="text-sm text-muted-foreground mt-1">{currentUser.score.toLocaleString()} pts</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="glass rounded-xl p-3">
                      <p className="text-lg font-bold">{currentUser.streak}d</p>
                      <p className="text-xs text-muted-foreground">Streak</p>
                    </div>
                    <div className="glass rounded-xl p-3">
                      <p className="text-lg font-bold">{data[0].score - currentUser.score}</p>
                      <p className="text-xs text-muted-foreground">To #1</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="glass border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Token Rewards</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { place: "1st Place", tokens: 500, color: "text-yellow-500" },
                  { place: "2nd Place", tokens: 300, color: "text-slate-400" },
                  { place: "3rd Place", tokens: 150, color: "text-orange-500" },
                  { place: "Top 10", tokens: 50, color: "text-primary" },
                ].map(r => (
                  <div key={r.place} className="flex justify-between items-center text-sm">
                    <span className={`font-medium ${r.color}`}>{r.place}</span>
                    <Badge variant="secondary" className="text-xs">{r.tokens} tokens</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="glass border-border/60">
              <CardContent className="pt-5">
                <p className="text-sm font-semibold mb-1">Next Season</p>
                <p className="text-xs text-muted-foreground mb-3">Season resets in 12 days. Push for a top 3 finish!</p>
                <Button size="sm" className="w-full text-xs">View Season Rules</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Leaderboard;
