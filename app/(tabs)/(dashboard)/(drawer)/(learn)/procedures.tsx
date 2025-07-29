import React, { useState, useCallback } from "react";
import { FlatList, useColorScheme } from "react-native";
import proceduresData from "@/data/procedures.json";
import { Procedure } from "@/types/dataTypes";
import { useRouter } from "expo-router";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ITEMS_PER_PAGE } from "@/constants/itemsPerPage";
import MinimizedProcedureCard from "@/components/MinimizedProcedureCard";
import { procedureImages } from "@/constants/proceduresImages";

export default function ProceduresScreen() {

  const proceduresWithImages = proceduresData.map((procedure) => {
    const imageData = procedureImages.find((img) => img.name === procedure.data.name);
    return {
      ...procedure,
      image: imageData ? imageData.image : null,
    };
  });
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [displayedProcedures, setDisplayedProcedures] = useState<Procedure[]>(
    proceduresWithImages.slice(0, ITEMS_PER_PAGE)
  );
  const [isLoading, setIsLoading] = useState(false);

  const loadMoreProcedures = useCallback(() => {
    if (isLoading || displayedProcedures.length >= proceduresWithImages.length)
      return;

    setIsLoading(true);
    setTimeout(() => {
      const newProcedures = proceduresWithImages.slice(
        displayedProcedures.length,
        displayedProcedures.length + ITEMS_PER_PAGE
      );
      setDisplayedProcedures((prevProcedures) => [
        ...prevProcedures,
        ...newProcedures,
      ]);
      setIsLoading(false);
    }, 400); // Simulate network delay
  }, [displayedProcedures, isLoading]);

  const handleCardPress = useCallback((id: string) => {
    router.push(`/procedury/${id}`);
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: Procedure; index: number }) => (
      <MinimizedProcedureCard
        procedure={item}
        image={item.image} // Pass the image to the card
        onPress={() => handleCardPress(index.toString())}
      />
    ),
    []
  );

  return (
      <FlatList
        data={displayedProcedures}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.data.name || index.toString()}
        contentContainerStyle={{ padding: 20, width:"100%" }}
        onEndReached={loadMoreProcedures}
        onEndReachedThreshold={0.1}
        ListFooterComponent={<LoadingSpinner isLoading={isLoading} />} 
      />
  );
}
