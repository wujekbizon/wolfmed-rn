import React, { useState, useCallback } from "react";
import { FlatList, useColorScheme } from "react-native";
import { Procedure } from "@/types/dataTypes";
import { useRouter } from "expo-router";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ITEMS_PER_PAGE } from "@/constants/itemsPerPage";
import MinimizedProcedureCard from "@/components/MinimizedProcedureCard";
import { procedureImages } from "@/constants/proceduresImages";
import { useProcedures } from "@/hooks/useProcedures";

export default function ProceduresScreen() {
  const { procedures, isLoading: apiLoading } = useProcedures()
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [isPaging, setIsPaging] = useState(false);

  const proceduresWithImages = procedures.map((procedure) => {
    const imageData = procedureImages.find(
      (img) => img.name === procedure.data.name
    );
    return { ...procedure, image: imageData ? imageData.image : null };
  });

  const displayed = proceduresWithImages.slice(0, page * ITEMS_PER_PAGE);

  const loadMore = useCallback(() => {
    if (isPaging || displayed.length >= proceduresWithImages.length) return;
    setIsPaging(true);
    setTimeout(() => {
      setPage((p) => p + 1);
      setIsPaging(false);
    }, 400);
  }, [isPaging, displayed.length, proceduresWithImages.length]);

  const handleCardPress = useCallback((id: string, image: any) => {
    router.push({
      pathname: `/procedury/[id]` as const,
      params: { id, image },
    });
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: Procedure; index: number }) => (
      <MinimizedProcedureCard
        procedure={item}
        image={item.image}
        onPress={() => handleCardPress(item.id, item.image)}
      />
    ),
    []
  );

  return (
    <FlatList
      data={displayed}
      renderItem={renderItem}
      keyExtractor={(item, index) => item.data.name || index.toString()}
      contentContainerStyle={{
        padding: 20,
        width: "100%",
        backgroundColor: colorScheme === "dark" ? "#000" : "#fff",
      }}
      onEndReached={loadMore}
      onEndReachedThreshold={0.1}
      ListFooterComponent={<LoadingSpinner isLoading={apiLoading || isPaging} />}
    />
  );
}
