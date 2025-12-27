package com.chat.controller;

import com.chat.entity.Message;
import com.chat.entity.Room;
import com.chat.repository.RoomRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin("http://localhost:3000")
@RequestMapping("/api/v1/rooms")
public class RoomController {

    private RoomRepository roomRepository;

    public RoomController(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }
    //create room
    @PostMapping
    public ResponseEntity<?> createRoom(@RequestBody String roomId) {

        if(roomRepository.findByRoomId(roomId) != null){
            //a room already exists
            return ResponseEntity.badRequest().body("Room already exists");
        }

        //create a new room
        Room room = new Room();
        room.setRoomId(roomId);
        Room savedRoom = roomRepository.save(room);
        return ResponseEntity.status(HttpStatus.CREATED).body(room);
    }

    //get room(trying to join a room)
    @GetMapping("/{roomId}")
    public ResponseEntity<?> joinRoom(@PathVariable String roomId) {
      Room room = roomRepository.findByRoomId(roomId);

      if(room == null){
          return ResponseEntity.badRequest().body("Room does not exist");
      }
      return ResponseEntity.ok(room);
    }

    //fetch message from rooms
    @GetMapping("/{roomId}/message")
    public ResponseEntity<List<Message>> getMessage(@PathVariable String roomId, @RequestParam(value = "page", defaultValue = "0", required = false) int page, @RequestParam(value = "size", defaultValue = "20", required = false) int size) {
        Room room = roomRepository.findByRoomId(roomId);

        if(room == null){
            return ResponseEntity.badRequest().body(null);
        }

        //get message: pagination
        List<Message> messages = room.getMessages();

        int start = Math.max(0, messages.size() - (page + 1) * size);
        int end = Math.min(messages.size(), start + size);

        List<Message> paginatedMessages =  messages.subList(start, end);

        return ResponseEntity.ok(paginatedMessages);
    }
}
