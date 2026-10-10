package com.resume.backend.controller;

import com.resume.backend.ResumeRequest;
import com.resume.backend.service.ResumeService;
import org.json.JSONObject;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

@RestController
@CrossOrigin
@RequestMapping("/api/v1/resume")
public class ResumeController {
    private ResumeService resumeService;

    public ResumeController(ResumeService resumeService){
        this.resumeService=resumeService;
    }
    @PostMapping("/generate")
    public ResponseEntity<Map<String,Object>> getResumeData(@RequestBody ResumeRequest resumeRequest) throws IOException {
     Map<String,Object> response=   resumeService.generateResumeResponse(resumeRequest.userDescription());
            return ResponseEntity.ok(response);
    }

    @GetMapping("/hello/{name}")
    public  ResponseEntity<String> gethello(@PathVariable String name,@RequestParam String age){
        return ResponseEntity.ok(name+" "+age);
    }
}


