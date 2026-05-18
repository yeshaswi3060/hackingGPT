from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    Image,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


BASE = Path(r"C:\Users\yesha\Desktop\testingGPT")
ASSETS = BASE / "networking_visual_assets"
OUT = BASE / "networking_teaching_guide_visual.pdf"


diagram_map = [
    ("01_what_network_does.png", "A network connects devices so they can share data, services, and internet access."),
    ("02_network_types.png", "PAN, LAN, MAN, and WAN describe networking by scale."),
    ("03_topologies_basic.png", "Star, bus, and ring topologies show common network layouts."),
    ("04_topologies_advanced.png", "Mesh and tree topologies are useful when resilience or hierarchy matters."),
    ("05_core_devices.png", "Core devices like routers, switches, firewalls, and access points each have a specific role."),
    ("06_media.png", "Transmission media determines speed, range, and reliability."),
    ("07_client_server.png", "Client-server is the dominant model for applications and internet services."),
    ("08_peer_to_peer.png", "Peer-to-peer networking allows devices to share directly."),
    ("09_home_network.png", "A home network shows how ISP, modem, router, and user devices connect."),
    ("10_osi_model.png", "The OSI model explains communication in seven layers."),
    ("11_tcp_ip_model.png", "The TCP/IP model is the practical model used by the internet."),
    ("12_encapsulation.png", "Encapsulation adds headers at each layer before transmission."),
    ("13_ipv4.png", "IPv4 addresses use four octets and separate network from host identity."),
    ("14_subnet_gateway.png", "Subnet masks define the local network, while gateways reach remote networks."),
    ("15_dns.png", "DNS translates domain names into IP addresses."),
    ("16_dhcp.png", "DHCP assigns IP settings automatically using the DORA process."),
    ("17_switch.png", "Switches forward frames by MAC address inside a LAN."),
    ("18_routing.png", "Routers move packets between different networks."),
    ("19_tcp_udp.png", "TCP focuses on reliability, while UDP focuses on speed and low overhead."),
    ("20_ports.png", "Ports identify the service or application receiving data."),
    ("21_packet_journey.png", "Opening a website involves DNS, routing, transport, and response delivery."),
    ("22_security.png", "Networking security combines filtering, encryption, and authentication."),
]


sections = [
    (
        "1. Networking Fundamentals",
        [
            "Networking means connecting two or more devices so they can exchange data and share resources. Those resources may be files, printers, applications, internet connectivity, or cloud services.",
            "Students already experience networking in everyday life: browsing websites, sending messages, joining online classes, using Wi-Fi, and printing across a local network.",
            "A good beginner explanation starts with this idea: networking is simply communication between devices using agreed rules.",
        ],
    ),
    (
        "2. Types of Networks and Topologies",
        [
            "Networks are often grouped by size. PAN is for short personal range, LAN is for local spaces like homes and labs, MAN covers city-scale areas, and WAN covers long distances such as the internet.",
            "Topology describes how devices are arranged. Star topology is common because it is easy to manage. Bus and ring are older teaching examples. Mesh emphasizes redundancy, and tree supports organized growth.",
        ],
    ),
    (
        "3. Devices and Transmission Media",
        [
            "A NIC gives a device network access. A switch connects devices within the same LAN. A router connects different networks. A modem links the local site to the service provider. An access point provides wireless connectivity. A firewall enforces security rules.",
            "Data can move through copper cable, fiber optic cable, or wireless radio. Wired connections are usually steadier and faster, while wireless connections are more flexible and convenient.",
        ],
    ),
    (
        "4. Communication Models and Layering",
        [
            "The client-server model is the standard pattern for most web and business systems: clients request, servers respond. Peer-to-peer systems allow devices to share directly without a central server.",
            "The OSI model helps students understand networking layer by layer. The TCP/IP model is the practical model used in real internet communication.",
            "Encapsulation explains how one message is wrapped with different headers at different layers until it becomes bits on a medium.",
        ],
    ),
    (
        "5. Addressing and Core Services",
        [
            "Every device needs an IP address so the network knows where to send traffic. IPv4 is still widely used and appears as four decimal octets, such as 192.168.1.10.",
            "A MAC address is the physical hardware identity used mainly in local delivery. A subnet mask separates network and host portions of an IP address. The default gateway forwards traffic outside the local network.",
            "DNS converts names into IP addresses. DHCP automatically assigns IP configuration such as address, subnet mask, gateway, and DNS server.",
        ],
    ),
    (
        "6. Traffic Flow and Protocols",
        [
            "Switching moves frames within a local network using MAC addresses. Routing moves packets between different networks using IP addresses.",
            "TCP is connection-oriented and reliable, making it good for websites, email, and file transfer. UDP is lighter and faster, making it useful for streaming, voice, and gaming.",
            "Ports identify which service should receive data. Common examples are 80 for HTTP, 443 for HTTPS, and 53 for DNS.",
        ],
    ),
    (
        "7. Security and Troubleshooting",
        [
            "Networking security is built from several layers: firewalls, encryption, authentication, safe wireless settings, strong passwords, and careful user behavior.",
            "Basic troubleshooting should follow a clean order: check cables or Wi-Fi first, inspect IP settings, test reachability with ping, verify DNS, then examine firewall or service issues.",
            "That repeatable method is worth teaching because it helps beginners solve real problems without guessing.",
        ],
    ),
]


def add_page_number(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 9)
    canvas.setFillColor(colors.HexColor("#64748B"))
    canvas.drawCentredString(A4[0] / 2, 18, f"Networking Basics Teaching Guide | Page {doc.page}")
    canvas.restoreState()


def main():
    styles = getSampleStyleSheet()
    title = ParagraphStyle(
        "CustomTitle",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=24,
        leading=30,
        textColor=colors.HexColor("#16324F"),
        alignment=TA_CENTER,
        spaceAfter=10,
    )
    subtitle = ParagraphStyle(
        "Subtitle",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=11,
        leading=15,
        textColor=colors.HexColor("#64748B"),
        alignment=TA_CENTER,
        spaceAfter=18,
    )
    h1 = ParagraphStyle(
        "H1",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=17,
        leading=22,
        textColor=colors.HexColor("#16324F"),
        spaceBefore=8,
        spaceAfter=8,
    )
    body = ParagraphStyle(
        "Body",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=10.5,
        leading=15.5,
        textColor=colors.HexColor("#1F2937"),
        spaceAfter=8,
    )
    caption = ParagraphStyle(
        "Caption",
        parent=styles["BodyText"],
        fontName="Helvetica-Oblique",
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#475569"),
        alignment=TA_CENTER,
        spaceAfter=12,
    )

    doc = SimpleDocTemplate(
        str(OUT),
        pagesize=A4,
        rightMargin=0.6 * inch,
        leftMargin=0.6 * inch,
        topMargin=0.55 * inch,
        bottomMargin=0.55 * inch,
    )

    story = []
    story.append(Paragraph("Networking Basics Teaching Guide", title))
    story.append(
        Paragraph(
            "Detailed beginner-friendly notes with 22 visual diagrams for classroom teaching",
            subtitle,
        )
    )

    overview = Table(
        [
            ["Audience", "Students, beginners, and classroom learners"],
            ["What it covers", "Networking basics, models, addressing, protocols, traffic flow, security, and troubleshooting"],
            ["Visual support", "22 diagrams built to explain each major concept clearly"],
        ],
        colWidths=[1.45 * inch, 5.7 * inch],
    )
    overview.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#DCE9F8")),
                ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#1F2937")),
                ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 10),
                ("GRID", (0, 0), (-1, -1), 0.6, colors.HexColor("#B8C7D9")),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    story.append(overview)
    story.append(Spacer(1, 16))

    for heading, paras in sections:
        story.append(Paragraph(heading, h1))
        for para in paras:
            story.append(Paragraph(para, body))

    story.append(PageBreak())

    for idx, (filename, cap) in enumerate(diagram_map, start=1):
        story.append(Paragraph(f"Diagram {idx}", h1))
        img = Image(str(ASSETS / filename), width=7.0 * inch, height=3.95 * inch)
        story.append(img)
        story.append(Spacer(1, 6))
        story.append(Paragraph(cap, caption))
        if idx != len(diagram_map):
            story.append(PageBreak())

    story.append(PageBreak())
    story.append(Paragraph("Quick Revision Table", h1))
    revision = Table(
        [
            ["Term", "Meaning", "Example"],
            ["LAN", "Local network in a small area", "School lab or home Wi-Fi"],
            ["WAN", "Long-distance network", "The internet"],
            ["Switch", "Connects devices inside one LAN", "PC to printer in same office"],
            ["Router", "Connects different networks", "Home network to ISP"],
            ["DNS", "Converts names to IP addresses", "google.com to an IP"],
            ["DHCP", "Assigns IP settings automatically", "Phone joins Wi-Fi"],
            ["TCP", "Reliable transport", "Web and email"],
            ["UDP", "Fast low-overhead transport", "Gaming and live calls"],
            ["Firewall", "Filters traffic by rules", "Blocks unwanted access"],
        ],
        colWidths=[1.1 * inch, 2.8 * inch, 3.2 * inch],
    )
    revision.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#16324F")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
                ("FONTSIZE", (0, 0), (-1, -1), 9.5),
                ("GRID", (0, 0), (-1, -1), 0.6, colors.HexColor("#B8C7D9")),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 7),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
                ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#F8FBFF")),
            ]
        )
    )
    story.append(revision)
    story.append(Spacer(1, 18))
    story.append(
        Paragraph(
            "A strong beginner understanding of networking should answer five big questions: what devices are connected, how they are arranged, how they are addressed, how data moves, and how the network is protected.",
            body,
        )
    )

    doc.build(story, onFirstPage=add_page_number, onLaterPages=add_page_number)
    print(f"Created {OUT}")


if __name__ == "__main__":
    main()
