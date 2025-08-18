#!/usr/bin/env python3
import sys
import os
import json
from moviepy.editor import VideoFileClip, CompositeVideoClip
import numpy as np
from sklearn.cluster import KMeans
import cv2

def extract_color_palette(video_path, n_colors=5):
    """Extract dominant colors from video frames"""
    try:
        # Read video with OpenCV
        cap = cv2.VideoCapture(video_path)
        colors = []
        
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        sample_frames = min(30, frame_count)  # Sample up to 30 frames
        
        for i in range(sample_frames):
            frame_pos = int(i * frame_count / sample_frames)
            cap.set(cv2.CAP_PROP_POS_FRAMES, frame_pos)
            ret, frame = cap.read()
            
            if ret:
                # Convert BGR to RGB
                frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                # Reshape frame to list of pixels
                pixels = frame.reshape(-1, 3)
                # Sample random pixels to speed up processing
                sample_size = min(1000, len(pixels))
                sampled_pixels = pixels[np.random.choice(len(pixels), sample_size, replace=False)]
                colors.extend(sampled_pixels)
        
        cap.release()
        
        if colors:
            # Use K-means to find dominant colors
            colors = np.array(colors)
            kmeans = KMeans(n_clusters=n_colors, random_state=42, n_init='auto')
            kmeans.fit(colors)
            return kmeans.cluster_centers_.astype(int)
        
    except Exception as e:
        print(f"Error extracting colors: {e}")
    
    return None

def apply_color_grading(clip, reference_colors, target_colors):
    """Apply color grading based on reference palette"""
    if reference_colors is None or target_colors is None:
        return clip
    
    def color_correct_frame(get_frame, t):
        frame = get_frame(t)
        # Simple color correction - this is a basic implementation
        # In production, you'd use more sophisticated algorithms
        
        # Adjust color balance
        frame = frame.astype(float)
        
        # Calculate average colors
        ref_avg = np.mean(reference_colors, axis=0)
        target_avg = np.mean(target_colors, axis=0)
        
        # Apply color shift
        color_shift = target_avg - ref_avg
        frame += color_shift
        
        # Clip values to valid range
        frame = np.clip(frame, 0, 255)
        
        return frame.astype(np.uint8)
    
    return clip.fl(color_correct_frame)

def apply_style_transfer(user_video_path, reference_video_path, style_template, options, output_path, job_id):
    """Main style transfer function"""
    try:
        print(f"PROGRESS:5")
        
        # Load user video
        user_clip = VideoFileClip(user_video_path)
        print(f"PROGRESS:15")
        
        # Extract colors from user video
        user_colors = extract_color_palette(user_video_path)
        print(f"PROGRESS:25")
        
        reference_colors = None
        if reference_video_path and os.path.exists(reference_video_path):
            # Extract colors from reference video
            reference_colors = extract_color_palette(reference_video_path)
            print(f"PROGRESS:40")
        elif style_template:
            # Use predefined color palettes for templates
            template_palettes = {
                'cinematic': np.array([[70, 80, 90], [120, 100, 80], [200, 180, 160], [50, 60, 70], [180, 160, 140]]),
                'vibrant': np.array([[255, 100, 100], [100, 255, 100], [100, 100, 255], [255, 255, 100], [255, 100, 255]]),
                'minimal': np.array([[240, 240, 240], [200, 200, 200], [160, 160, 160], [120, 120, 120], [80, 80, 80]]),
                'vintage': np.array([[200, 180, 140], [180, 150, 100], [160, 140, 100], [140, 120, 80], [120, 100, 70]])
            }
            reference_colors = template_palettes.get(style_template)
            print(f"PROGRESS:40")
        
        # Apply color grading if enabled
        processed_clip = user_clip
        if options.get('colorPalette', True) and reference_colors is not None:
            processed_clip = apply_color_grading(processed_clip, user_colors, reference_colors)
            print(f"PROGRESS:60")
        
        # Apply contrast and brightness adjustments
        if options.get('contrastBrightness', True):
            processed_clip = processed_clip.fx(lambda clip: clip.multiply_color(1.1))  # Slight contrast boost
            print(f"PROGRESS:70")
        
        # Audio normalization
        if options.get('audioNormalization', True) and processed_clip.audio:
            processed_clip = processed_clip.audio_normalize()
            print(f"PROGRESS:80")
        
        # Apply speed adjustments for pacing if enabled
        if options.get('matchPacing', True) and reference_video_path:
            # This is a simplified implementation
            # In production, you'd analyze the rhythm and pacing of the reference video
            pass
        
        print(f"PROGRESS:90")
        
        # Write the output video
        processed_clip.write_videofile(
            output_path,
            codec='libx264',
            audio_codec='aac',
            temp_audiofile='temp-audio.m4a',
            remove_temp=True,
            verbose=False,
            logger=None
        )
        
        # Clean up
        user_clip.close()
        processed_clip.close()
        
        print(f"PROGRESS:100")
        print("Video processing completed successfully")
        
    except Exception as e:
        print(f"Error processing video: {e}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 7:
        print("Usage: video_processor.py <user_video> <reference_video> <style_template> <options_json> <output_path> <job_id>")
        sys.exit(1)
    
    user_video_path = sys.argv[1]
    reference_video_path = sys.argv[2] if sys.argv[2] else None
    style_template = sys.argv[3] if sys.argv[3] else None
    options_json = sys.argv[4]
    output_path = sys.argv[5]
    job_id = sys.argv[6]
    
    try:
        options = json.loads(options_json)
    except:
        options = {}
    
    apply_style_transfer(user_video_path, reference_video_path, style_template, options, output_path, job_id)
