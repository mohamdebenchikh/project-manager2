<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\File;

class FileUploadController extends Controller
{
    /**
     * Allowed file types and their maximum sizes (in KB)
     */
    protected $allowedTypes = [
        'image' => [
            'extensions' => ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            'max_size' => 5120, // 5MB
            'mime_types' => ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        ],
        'document' => [
            'extensions' => ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'],
            'max_size' => 10240, // 10MB
            'mime_types' => [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'text/plain'
            ]
        ],
        'avatar' => [
            'extensions' => ['jpg', 'jpeg', 'png'],
            'max_size' => 2048, // 2MB
            'mime_types' => ['image/jpeg', 'image/png']
        ]
    ];

    /**
     * Upload a file
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function upload(Request $request)
    {
        try {
            $request->validate([
                'file' => ['required', 'file'],
                'type' => ['required', 'string', 'in:' . implode(',', array_keys($this->allowedTypes))],
                'folder' => ['nullable', 'string', 'max:255']
            ]);

            $file = $request->file('file');
            $type = $request->input('type');
            $folder = $request->input('folder', 'uploads');

            // Validate file type and size
            $this->validateFile($file, $type);

            // Generate unique filename
            $filename = $this->generateUniqueFilename($file);

            // Store file
            $path = $file->storeAs(
                "public/{$folder}/" . Auth::id(),
                $filename
            );

            if (!$path) {
                throw new \Exception('Failed to store file');
            }

            return response()->json([
                'success' => true,
                'path' => $path,
                'url' => Storage::url($path),
                'name' => $filename,
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Delete a file
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Request $request)
    {
        try {
            $request->validate([
                'path' => ['required', 'string']
            ]);

            $path = $request->input('path');

            // Security check: ensure the file belongs to the user
            if (!Str::contains($path, '/' . Auth::id() . '/')) {
                throw new \Exception('Unauthorized access to file');
            }

            if (!Storage::exists($path)) {
                throw new \Exception('File not found');
            }

            if (!Storage::delete($path)) {
                throw new \Exception('Failed to delete file');
            }

            return response()->json([
                'success' => true,
                'message' => 'File deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Validate file type and size
     *
     * @param \Illuminate\Http\UploadedFile $file
     * @param string $type
     * @throws \Exception
     */
    protected function validateFile($file, $type)
    {
        if (!isset($this->allowedTypes[$type])) {
            throw new \Exception('Invalid file type');
        }

        $config = $this->allowedTypes[$type];

        // Check extension
        if (!in_array(strtolower($file->getClientOriginalExtension()), $config['extensions'])) {
            throw new \Exception('Invalid file extension');
        }

        // Check MIME type
        if (!in_array($file->getMimeType(), $config['mime_types'])) {
            throw new \Exception('Invalid file type');
        }

        // Check size
        if ($file->getSize() > $config['max_size'] * 1024) {
            throw new \Exception("File size must not exceed {$config['max_size']}KB");
        }
    }

    /**
     * Generate a unique filename
     *
     * @param \Illuminate\Http\UploadedFile $file
     * @return string
     */
    protected function generateUniqueFilename($file)
    {
        $extension = $file->getClientOriginalExtension();
        return Str::uuid() . '.' . $extension;
    }
}