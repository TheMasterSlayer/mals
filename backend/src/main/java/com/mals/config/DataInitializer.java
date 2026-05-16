package com.mals.config;

import com.mals.entity.*;
import com.mals.enums.*;
import com.mals.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds the database with realistic military assets and default user accounts
 * on first startup (only when the users table is empty).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository  userRepository;
    private final AssetRepository assetRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) return;

        log.info("Seeding database with initial MALS data...");

        // ── Default Users ─────────────────────────────────────────────────────
        User admin = userRepository.save(User.builder()
            .username("admin")
            .email("admin@mals.mil")
            .password(passwordEncoder.encode("Admin@12345"))
            .role(Role.ADMIN)
            .rank("General")
            .unit("HQ Joint Chiefs")
            .build());

        User commander = userRepository.save(User.builder()
            .username("commander.hayes")
            .email("hayes@mals.mil")
            .password(passwordEncoder.encode("Command@12345"))
            .role(Role.COMMANDER)
            .rank("Colonel")
            .unit("1st Armored Division")
            .build());

        User logOfficer = userRepository.save(User.builder()
            .username("officer.chen")
            .email("chen@mals.mil")
            .password(passwordEncoder.encode("Logistics@12345"))
            .role(Role.LOGISTICS_OFFICER)
            .rank("Captain")
            .unit("82nd Support Brigade")
            .build());

        log.info("Created {} default users", 3);

        // ── Vehicles ─────────────────────────────────────────────────────────
        assetRepository.save(asset("M1A2 Abrams Main Battle Tank", AssetType.VEHICLE,
            "Armored Vehicle", "TK-M1A2-001", 12, AssetStatus.AVAILABLE,
            "Fort Bragg, NC", null,
            "70-ton main battle tank with 120mm smoothbore gun, composite armor.",
            35.1397, -79.0062));

        assetRepository.save(asset("M2 Bradley Infantry Fighting Vehicle", AssetType.VEHICLE,
            "Armored Vehicle", "IFV-M2-004", 24, AssetStatus.AVAILABLE,
            "Fort Hood, TX", null,
            "Tracked IFV with 25mm autocannon and TOW missile launcher.",
            31.1357, -97.7782));

        assetRepository.save(asset("HMMWV Humvee", AssetType.VEHICLE,
            "Utility Vehicle", "HMV-0072", 48, AssetStatus.IN_USE,
            "Camp Lejeune, NC", "3rd Marine Battalion",
            "High Mobility Multipurpose Wheeled Vehicle. Various configurations.",
            34.6771, -77.3396));

        assetRepository.save(asset("MRAP MaxxPro", AssetType.VEHICLE,
            "Protected Vehicle", "MRAP-MP-019", 8, AssetStatus.DEPLOYED,
            "FOB Salerno, Afghanistan", "75th Ranger Regiment",
            "Mine-Resistant Ambush Protected vehicle with V-hull blast deflection.",
            33.3889, 70.0)); // approximate

        assetRepository.save(asset("Paladin M109A6 Howitzer", AssetType.VEHICLE,
            "Artillery", "HOW-PAL-007", 6, AssetStatus.MAINTENANCE,
            "Fort Sill, OK", "Field Artillery School",
            "Self-propelled 155mm howitzer. Currently under scheduled maintenance.",
            34.6656, -98.4017));

        assetRepository.save(asset("M1126 Stryker ICV", AssetType.VEHICLE,
            "Armored Vehicle", "STR-ICV-031", 18, AssetStatus.AVAILABLE,
            "JBLM, WA", null,
            "8-wheeled Infantry Carrier Vehicle. Modular protection system.",
            47.1073, -122.5768));

        // ── Aircraft ──────────────────────────────────────────────────────────
        assetRepository.save(asset("UH-60 Black Hawk Helicopter", AssetType.AIRCRAFT,
            "Utility Helicopter", "AC-UH60-012", 6, AssetStatus.AVAILABLE,
            "Fort Campbell, KY", null,
            "Multi-mission utility tactical transport helicopter.",
            36.6722, -87.4756));

        assetRepository.save(asset("AH-64E Apache Guardian", AssetType.AIRCRAFT,
            "Attack Helicopter", "AC-AH64-003", 4, AssetStatus.DEPLOYED,
            "FOB Fenty, Afghanistan", "101st Combat Aviation Brigade",
            "Attack helicopter with 30mm chain gun, Hydra 70 rockets, Hellfire missiles.",
            34.4100, 70.4200));

        assetRepository.save(asset("CH-47F Chinook", AssetType.AIRCRAFT,
            "Heavy Lift Helicopter", "AC-CH47-008", 3, AssetStatus.AVAILABLE,
            "Fort Carson, CO", null,
            "Twin-engine heavy-lift tandem rotor helicopter. 10-ton payload.",
            38.7383, -104.7856));

        assetRepository.save(asset("RQ-11B Raven UAV", AssetType.AIRCRAFT,
            "Unmanned Aerial Vehicle", "UAV-RV11-044", 20, AssetStatus.AVAILABLE,
            "Fort Benning, GA", null,
            "Hand-launched small UAS for reconnaissance. 90-min endurance.",
            32.3544, -84.9869));

        // ── Weapons ───────────────────────────────────────────────────────────
        assetRepository.save(asset("M4A1 Carbine", AssetType.WEAPON,
            "Individual Weapon", "WPN-M4A1-0229", 350, AssetStatus.AVAILABLE,
            "Armory Alpha, Fort Bragg", null,
            "5.56mm selective-fire carbine. Standard infantry weapon.",
            35.1397, -79.0062));

        assetRepository.save(asset("M240B Machine Gun", AssetType.WEAPON,
            "Crew-Served Weapon", "WPN-M240-0057", 45, AssetStatus.AVAILABLE,
            "Armory Bravo, Fort Bragg", null,
            "7.62mm belt-fed medium machine gun. 700–1000 rpm cyclic rate.",
            35.1397, -79.0062));

        assetRepository.save(asset("FIM-92 Stinger MANPADS", AssetType.WEAPON,
            "Air Defense Weapon", "WPN-STG-0012", 8, AssetStatus.AVAILABLE,
            "Air Defense Battery, Fort Bliss", null,
            "Man-portable infrared-homing surface-to-air missile system.",
            31.8456, -106.4286));

        assetRepository.save(asset("M107 .50 Cal Sniper Rifle", AssetType.WEAPON,
            "Precision Weapon", "WPN-M107-0033", 15, AssetStatus.IN_USE,
            "SOCOM Range, Fort Bragg", "Special Forces Group 7",
            "Long-range anti-materiel precision rifle.",
            35.1397, -79.0062));

        // ── Equipment ─────────────────────────────────────────────────────────
        assetRepository.save(asset("AN/PVS-14 Night Vision Monocular", AssetType.EQUIPMENT,
            "Optical Equipment", "EQP-NVG-0782", 180, AssetStatus.AVAILABLE,
            "Supply Depot, Fort Bragg", null,
            "Gen III image intensifier night vision monocular. Head or weapon mountable.",
            35.1397, -79.0062));

        assetRepository.save(asset("FLIR Systems SOPHIE", AssetType.EQUIPMENT,
            "Thermal Imaging", "EQP-FLIR-0091", 12, AssetStatus.AVAILABLE,
            "ISR Section, JBLM", null,
            "Handheld thermal-imaging system for target acquisition and reconnaissance.",
            47.1073, -122.5768));

        assetRepository.save(asset("AN/PRC-152A Radio", AssetType.COMMUNICATION,
            "Tactical Radio", "COM-PRC-0334", 95, AssetStatus.AVAILABLE,
            "Comms Section, Fort Campbell", null,
            "Multiband handheld radio. SATCOM and LOS waveforms. Type-1 encryption.",
            36.6722, -87.4756));

        assetRepository.save(asset("Joint Effects Targeting System (JETS)", AssetType.EQUIPMENT,
            "Targeting System", "EQP-JETS-0017", 7, AssetStatus.DEPLOYED,
            "Forward Observer Team, 82nd ABN", "82nd Airborne Division",
            "Lightweight laser rangefinder and targeting device.",
            35.1397, -79.0062));

        // ── Supplies ──────────────────────────────────────────────────────────
        assetRepository.save(asset("MRE Case (Meal Ready-to-Eat)", AssetType.SUPPLY,
            "Rations", "SUP-MRE-8821", 2400, AssetStatus.AVAILABLE,
            "Warehouse C, Fort Bragg", null,
            "24-meal case. 1200 kcal/meal avg. 3-year shelf life.",
            35.1397, -79.0062));

        assetRepository.save(asset("IFAK Individual First Aid Kit", AssetType.SUPPLY,
            "Medical Supply", "SUP-IFAK-1147", 420, AssetStatus.AVAILABLE,
            "Medical Depot, Fort Sam Houston", null,
            "Tourniquet, pressure bandage, chest seal, hemostatic gauze.",
            29.4530, -98.4310));

        assetRepository.save(asset("9V Lithium Battery Pack", AssetType.SUPPLY,
            "Power Supply", "SUP-BAT-2290", 3, AssetStatus.AVAILABLE,
            "Supply Depot, Fort Bragg", null,
            "9V lithium batteries for radios and NVGs. Low stock — reorder required.",
            35.1397, -79.0062));

        log.info("Seeded {} assets", assetRepository.count());
        log.info("Database seed complete. Default credentials:");
        log.info("  Admin:    admin@mals.mil / Admin@12345");
        log.info("  Commander:hayes@mals.mil / Command@12345");
        log.info("  Officer:  chen@mals.mil  / Logistics@12345");
    }

    private Asset asset(String name, AssetType type, String category, String serial,
                        int qty, AssetStatus status, String location, String assignedTo,
                        String description, double lat, double lng) {
        return Asset.builder()
            .name(name).type(type).category(category).serialNumber(serial)
            .quantity(qty).status(status).location(location).assignedTo(assignedTo)
            .description(description).latitude(lat).longitude(lng)
            .build();
    }
}
