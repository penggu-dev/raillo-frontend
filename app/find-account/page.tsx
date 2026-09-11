"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageLayout from "@/components/layout/PageLayout";
import { FindMemberTab } from "@/components/find-account/FindMemberTab";
import { FindPasswordTab } from "@/components/find-account/FindPasswordTab";

export default function FindAccountPage() {
  const [activeTab, setActiveTab] = useState("member");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get("tab");
    if (tabParam === "password") {
      setActiveTab("password");
    }
  }, []);

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              회원번호/비밀번호 찾기
            </h1>
            <p className="text-muted-foreground">
              본인확인을 통해 회원정보를 찾으실 수 있습니다
            </p>
          </div>

          <Card className="shadow-lg">
            <CardContent className="p-8">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 h-14">
                  <TabsTrigger
                    value="member"
                    className="text-base font-medium py-4 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
                  >
                    회원번호 찾기
                  </TabsTrigger>
                  <TabsTrigger
                    value="password"
                    className="text-base font-medium py-4 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
                  >
                    비밀번호 찾기
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="member" className="space-y-6">
                  <FindMemberTab />
                </TabsContent>

                <TabsContent value="password" className="space-y-6">
                  <FindPasswordTab />
                </TabsContent>
              </Tabs>

              <div className="mt-8 pt-6 border-t border-border">
                <div className="flex justify-center space-x-6 text-sm">
                  <Link href="/login" className="text-primary hover:text-primary-active font-semibold">
                    로그인하기
                  </Link>
                  <span className="text-muted-foreground opacity-40">|</span>
                  <Link href="/signup" className="text-primary hover:text-primary-active font-semibold">
                    회원가입하기
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
