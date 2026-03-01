package com.smartclass.dashboard;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;

public class MongoConnectionTest {
    public static void main(String[] args) {
        String uri = "mongodb+srv://anvitha:Avanthi%40123@cluster0.llvfl1y.mongodb.net/campus_dashboard?retryWrites=true&w=majority&appName=Cluster0";
        System.out.println("Testing connection to: " + uri);
        
        try (MongoClient mongoClient = MongoClients.create(uri)) {
            MongoDatabase database = mongoClient.getDatabase("campus_dashboard");
            System.out.println("Attempting to ping...");
            Document ping = new Document("ping", 1);
            database.runCommand(ping);
            System.out.println("Ping successful! Connected gracefully.");
        } catch (Exception e) {
            System.err.println("Connection failed!");
            e.printStackTrace();
        }
    }
}
