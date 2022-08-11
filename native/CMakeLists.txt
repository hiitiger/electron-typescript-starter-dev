cmake_minimum_required(VERSION 3.15)
cmake_policy(SET CMP0091 NEW)
add_definitions(-DNAPI_VERSION=6)
add_definitions(-DNAPI_EXPERIMENTAL)



set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

if("${CMAKE_GENERATOR_PLATFORM}" STREQUAL "x64")
    SET(OUTPUT_DIR ${CMAKE_SOURCE_DIR}/build_x64)
else() 
    SET(OUTPUT_DIR ${CMAKE_SOURCE_DIR}/build_Win32)
endif()


#add a preprocessor definition
add_definitions( -DNOMINMAX )
add_definitions( -D_WIN32_WINNT=0x0601 )
add_definitions( -DUNICODE -D_UNICODE )

add_compile_options(
            $<$<CONFIG:Release>:/O2>
            $<$<CONFIG:Release>:/MT>
            $<$<CONFIG:Release>:/Zi>
            $<$<CONFIG:Release>:/MP>
            $<$<CONFIG:Debug>:/MTd>
            $<$<CONFIG:Debug>:/MP>
            )
            
            
                
project(app_core)

message ("CMAKE_JS_INC PATH : " ${CMAKE_JS_INC} )

include_directories(${CMAKE_JS_INC})

file(GLOB_RECURSE SOURCE_FILES src/*.c src/*.cc src/*.cpp)

add_library(${PROJECT_NAME} SHARED ${SOURCE_FILES} ${CMAKE_JS_SRC})
set_target_properties(${PROJECT_NAME} PROPERTIES PREFIX "" SUFFIX ".node")
target_link_libraries(${PROJECT_NAME} ${CMAKE_JS_LIB})

execute_process(COMMAND node -p "require('node-addon-api').include"
        WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
        OUTPUT_VARIABLE NODE_ADDON_API_DIR
        )
string(REGEX REPLACE "[\r\n\"]" "" NODE_ADDON_API_DIR ${NODE_ADDON_API_DIR})

target_include_directories(${PROJECT_NAME} PRIVATE ${NODE_ADDON_API_DIR})

target_link_options(${PROJECT_NAME} PRIVATE /DEBUG;/OPT:REF;/OPT:ICF; )
