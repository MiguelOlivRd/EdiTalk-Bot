import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Image, TextInput, 
         KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from "react-native";
import styles from "./styles";

interface Message {
  id: string;
  text: string;
  sender: "user" | "agent";
}

const quickQuestions = [
  "O que é o cadastro socioeconômico?",
  "Qual a carga horária mínima do curso de computação?",
  "Qual é o valor do Auxílio Emergencial Estudantil?",
  "Quais são os requisitos para participar do cadastro socioeconômico?",
  "Quais os requisitos para solicitar o Auxílio Atividades Obrigatórias Externas?"
];

const Chat = () => {

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [verDuvidas, setVerDuvidas] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const agenteRota = process.env.EXPO_PUBLIC_API_URL

  const agentAvatar = require("../../assets/images/carloacutis.png");

  useEffect(() => {
    setMessages([
      {
        id: "initial-message",
        text: "Olá, como posso te ajudar hoje?",
        sender: "agent",
      },
    ]);
  }, []);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (input.trim() === "" || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    const messageToSend = input;
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`${ agenteRota }`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: "789",
          msg: messageToSend,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const agentMessage: Message = {
        id: Date.now().toString() + "-agent",
        text: data.response || "Desculpe, não consegui processar sua mensagem.",
        sender: "agent",
      };
      setMessages((prevMessages) => [...prevMessages, agentMessage]);
    } catch (error) {
      console.log("Failed to send message:", error);
      const errorMessage: Message = {
        id: Date.now().toString() + "-error",
        text: "Desculpe, ocorreu um erro de conexão. Tente novamente mais tarde.",
        sender: "agent",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
      setVerDuvidas(false)
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>EdiTalk-Bot</Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 16, paddingHorizontal: 16 }}
      >
        <Text style={styles.infoText}>
          Você pode me perguntar algo sobre os editais da universidade.
        </Text>

        {messages.map((msg) => (
          <View
            key={msg.id}
            style={{
              marginVertical: 4,
              alignItems: msg.sender === "user" ? "flex-end" : "flex-start",
            }}
          >
            {msg.sender === "agent" ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  maxWidth: "90%",
                }}
              >
                <Image source={agentAvatar} style={styles.avatar} />
                <View style={styles.agentMessageBubble}>
                  <Text style={styles.agentName}>Assistente Carlo Acutis</Text>
                  <Text style={styles.agentMessageText}>{msg.text}</Text>
                </View>
              </View>
            ) : (
              <View
                style={{
                  backgroundColor: "#2753A9",
                  borderRadius: 20,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  maxWidth: "80%",
                }}
              >
                <Text style={{ color: "white" }}>{msg.text}</Text>
              </View>
            )}
          </View>
        ))}
        {isLoading && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              marginVertical: 4,
            }}
          >
            <Image source={agentAvatar} style={styles.avatar} />
            <View style={styles.agentMessageBubble}>
              <ActivityIndicator size="small" color="#2753A9" />
            </View>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity onPress={() => setVerDuvidas(!verDuvidas)} style={{ padding: 10 }}>
        <Text style={{ textAlign: "center", fontSize: 16, color: "#2753A9", fontWeight: "bold" }}
        > Dúvidas frequentes
        </Text>
      </TouchableOpacity>

      <View>
        {verDuvidas && <View style={styles.quickQuestionsContainer}>
          {quickQuestions.map((question, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.quickQuestionButton}
              onPress={() => setInput(question)}
            >
              <Text style={styles.quickQuestionText}>{question}</Text>
            </TouchableOpacity>
          ))}
        </View>}

        <View style={styles.inputArea}>
          <TextInput
            style={styles.textInput}
            placeholder="Digite sua dúvida..."
            value={input}
            onChangeText={setInput}
            placeholderTextColor="#B0B0B0"
            onSubmitEditing={handleSendMessage}
          />
          <TouchableOpacity onPress={handleSendMessage} style={{ padding: 10 }}>
            <Text
              style={{ fontSize: 16, color: "#2753A9", fontWeight: "bold" }}
            >
              Enviar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Chat;
